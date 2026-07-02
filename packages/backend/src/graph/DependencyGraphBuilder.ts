import { LlmClient } from '../llms/LlmClient'
import type { LlmProvider } from '../llms/providers'
import { TOKEN_DEPENDENCIES_PROMPT } from './prompt'
import {
  TOKEN_DEPENDENCIES_NAME,
  TOKEN_DEPENDENCIES_SCHEMA,
} from './schema'
import {
  DEPENDENCY_EDGE_TYPE_COLLATERAL,
  DEPENDENCY_EDGE_TYPE_LOAN,
  DEPENDENCY_EDGE_TYPE_PROTOCOL,
  DEPENDENCY_EDGE_TYPE_UNDERLYING,
  DEPENDENCY_LEAF_NODE_TYPES,
  DEPENDENCY_NODE_TYPE_MARKET,
  DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN,
  DEPENDENCY_NODE_TYPE_PROTOCOL,
} from './types'
import type {
  DependencyEdgeType,
  DependencyGraph,
  DependencyNode,
  DependencyNodeType,
  Graph,
  DependencyGraphInput,
  TokenDependency,
  TokenDependencies,
} from './types'

export class DependencyGraphBuilder {
  private readonly llmClient: LlmClient

  constructor(provider?: LlmProvider) {
    this.llmClient = LlmClient.create(provider)
  }

  async build(input: DependencyGraphInput, chain: string): Promise<DependencyGraph> {
    const graph = this.newGraph(chain)
    const root = this.newNode(DEPENDENCY_NODE_TYPE_MARKET, input.market, chain, input.market)

    graph.nodes.set(root.id, root)
    this.addDependencyNode(graph, root, DEPENDENCY_EDGE_TYPE_PROTOCOL, input.protocol, DEPENDENCY_NODE_TYPE_PROTOCOL)
    if (input.loan) {
      this.addDependencyNode(graph, root, DEPENDENCY_EDGE_TYPE_LOAN, input.loan, DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN)
    }

    for (const collateral of input.collaterals) {
      const tokenDependencies = await this.getTokenDependencies(graph, collateral)
      const node = this.addDependencyNode(graph, root, DEPENDENCY_EDGE_TYPE_COLLATERAL, collateral, tokenDependencies.tokenType)
      await this.expandTokenNode(graph, node, tokenDependencies.dependencies, new Set([root.id]))
    }

    return { root: root.id, nodes: [...graph.nodes.values()], edges: graph.edges }
  }

  private addDependencyNode(graph: Graph, root: DependencyNode, edgeType: DependencyEdgeType, label: string, nodeType: DependencyNodeType): DependencyNode {
    const node = this.newNode(nodeType, label, graph.chain)
    graph.nodes.set(node.id, node)
    graph.edges.push({ from: root.id, to: node.id, type: edgeType })
    return node
  }

  private async expandTokenNode(
    graph: Graph,
    node: DependencyNode,
    dependencies: TokenDependency[],
    path: Set<string>,
  ): Promise<void> {
    if (this.isLeafNodeType(node.type)) return
    if (path.has(node.id)) return
    if (graph.visitedNodeIds.has(node.id)) return

    graph.visitedNodeIds.add(node.id)
    const nextPath = new Set([...path, node.id])

    for (const dependency of dependencies) {
      const dependencyNode = this.addDependencyNode(
        graph,
        node,
        this.edgeTypeForDependency(dependency.kind),
        dependency.label,
        dependency.kind,
      )

      if (this.isLeafNodeType(dependencyNode.type)) continue
      const dependencyTokenDependencies = await this.getTokenDependencies(graph, dependency.label)
      await this.expandTokenNode(graph, dependencyNode, dependencyTokenDependencies.dependencies, nextPath)
    }
  }

  private async getTokenDependencies(graph: Graph, token: string): Promise<TokenDependencies> {
    const key = this.dependenciesCacheKey(graph, token)
    const cached = graph.dependenciesCache.get(key)
    if (cached) return cached

    const dependencies = this.requestTokenDependencies(graph, token)
    graph.dependenciesCache.set(key, dependencies)
    return dependencies
  }

  private isLeafNodeType(type: DependencyNodeType): boolean {
    return (DEPENDENCY_LEAF_NODE_TYPES as readonly DependencyNodeType[]).includes(type)
  }

  private edgeTypeForDependency(kind: DependencyNodeType): DependencyEdgeType {
    return kind === DEPENDENCY_NODE_TYPE_PROTOCOL ? DEPENDENCY_EDGE_TYPE_PROTOCOL : DEPENDENCY_EDGE_TYPE_UNDERLYING
  }

  private dependenciesCacheKey(graph: Graph, token: string): string {
    return `${graph.chain}:${token.trim().toLowerCase()}`
  }

  private id(...parts: string[]): string {
    return parts
      .map((part) => part.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
      .filter(Boolean)
      .join(':')
  }

  private newNode(type: DependencyNodeType, label: string, ...idParts: string[]): DependencyNode {
    return {
      id: this.id(type, ...idParts, label),
      type,
      label,
    }
  }

  private newGraph(chain: string): Graph {
    return {
      chain,
      nodes: new Map(),
      edges: [],
      dependenciesCache: new Map(),
      visitedNodeIds: new Set(),
    }
  }

  private async requestTokenDependencies(graph: Graph, token: string): Promise<TokenDependencies> {
    return this.llmClient.requestJson<TokenDependencies>({
      instructions: TOKEN_DEPENDENCIES_PROMPT,
      name: TOKEN_DEPENDENCIES_NAME,
      schema: TOKEN_DEPENDENCIES_SCHEMA,
      payload: {
        chain: graph.chain,
        token,
      },
    })
  }
}
