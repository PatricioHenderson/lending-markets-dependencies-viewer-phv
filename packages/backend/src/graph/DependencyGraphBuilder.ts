import { LlmClient } from '../llms/LlmClient'
import { DEFAULT_LLM_PROVIDER, type LlmProvider } from '../llms/providers'
import { TOKEN_DEPENDENCIES_PROMPT } from './prompt'
import {
  TOKEN_DEPENDENCIES_NAME,
  TOKEN_DEPENDENCIES_SCHEMA,
} from './schema'
import { canonicalizeProtocolLabel } from '../registry/protocols'
import { TOKEN_REGISTRY } from '../registry/tokens'
import { recordLlmSuggestion } from '../registry/llmSuggestions'
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
  Provenance,
  TokenDependency,
  TokenDependencies,
} from './types'

const PROVENANCE_RANK: Record<Provenance, number> = { llm: 0, curated: 1, api: 2 }

export class DependencyGraphBuilder {
  private llmClient?: LlmClient

  constructor(private readonly provider?: LlmProvider) {}

  async build(input: DependencyGraphInput, chain: string): Promise<DependencyGraph> {
    const graph = this.newGraph(chain, input.chainId)
    const root = this.newNode(DEPENDENCY_NODE_TYPE_MARKET, input.market, 'api', chain, input.market)
    if (input.marketSupply) root.marketSupply = input.marketSupply
    if (input.marketAddress) root.address = input.marketAddress

    graph.nodes.set(root.id, root)
    this.addDependencyNode(graph, root, DEPENDENCY_EDGE_TYPE_PROTOCOL, input.protocol, DEPENDENCY_NODE_TYPE_PROTOCOL, 'api')
    if (input.loan) {
      this.addDependencyNode(graph, root, DEPENDENCY_EDGE_TYPE_LOAN, input.loan, DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN, 'api', input.loanAddress)
    }

    for (const collateral of input.collaterals) {
      const tokenDependencies = await this.getTokenDependencies(graph, collateral)
      const node = this.addDependencyNode(
        graph,
        root,
        DEPENDENCY_EDGE_TYPE_COLLATERAL,
        collateral,
        tokenDependencies.tokenType,
        tokenDependencies.source,
        input.collateralAddresses?.[collateral],
      )
      const supplyMetrics = input.collateralMetrics?.[collateral]
      if (supplyMetrics) node.supplyMetrics = supplyMetrics
      await this.expandTokenNode(graph, node, tokenDependencies.dependencies, new Set([root.id]), tokenDependencies.source)
    }

    return { root: root.id, chainId: input.chainId, nodes: [...graph.nodes.values()], edges: graph.edges }
  }

  private addDependencyNode(
    graph: Graph,
    root: DependencyNode,
    edgeType: DependencyEdgeType,
    label: string,
    nodeType: DependencyNodeType,
    provenance: Provenance,
    address?: string,
  ): DependencyNode {
    const resolvedLabel = nodeType === DEPENDENCY_NODE_TYPE_PROTOCOL ? canonicalizeProtocolLabel(label) : label
    const resolvedAddress = address ?? this.registryAddress(resolvedLabel, graph.chainId)
    const id = this.id(nodeType, graph.chain, resolvedLabel)
    const existing = graph.nodes.get(id)

    if (existing) {
      existing.provenance = this.strongerProvenance(existing.provenance, provenance)
      if (!existing.address && resolvedAddress) existing.address = resolvedAddress
      graph.edges.push({ from: root.id, to: existing.id, type: edgeType, provenance })
      return existing
    }

    const node = this.newNode(nodeType, resolvedLabel, provenance, graph.chain)
    if (resolvedAddress) node.address = resolvedAddress
    graph.nodes.set(node.id, node)
    graph.edges.push({ from: root.id, to: node.id, type: edgeType, provenance })
    return node
  }

  private registryAddress(label: string, chainId: number): string | undefined {
    return TOKEN_REGISTRY[label.trim().toLowerCase()]?.addresses?.[chainId]
  }

  private strongerProvenance(a: Provenance, b: Provenance): Provenance {
    return PROVENANCE_RANK[b] > PROVENANCE_RANK[a] ? b : a
  }

  private async expandTokenNode(
    graph: Graph,
    node: DependencyNode,
    dependencies: TokenDependency[],
    path: Set<string>,
    provenance: Provenance,
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
        provenance,
      )

      if (this.isLeafNodeType(dependencyNode.type)) continue
      const dependencyTokenDependencies = await this.getTokenDependencies(graph, dependency.label)
      await this.expandTokenNode(graph, dependencyNode, dependencyTokenDependencies.dependencies, nextPath, dependencyTokenDependencies.source)
    }
  }

  private async getTokenDependencies(graph: Graph, token: string): Promise<TokenDependencies> {
    const key = this.dependenciesCacheKey(graph, token)
    const cached = graph.dependenciesCache.get(key)
    if (cached) return cached

    const registryEntry = TOKEN_REGISTRY[token.trim().toLowerCase()]
    const dependencies: Promise<TokenDependencies> = registryEntry
      ? Promise.resolve({
          symbol: token,
          tokenType: registryEntry.type,
          dependencies: registryEntry.dependencies,
          source: 'curated',
        })
      : this.requestTokenDependencies(graph, token)

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

  private newNode(type: DependencyNodeType, label: string, provenance: Provenance, ...idParts: string[]): DependencyNode {
    return {
      id: this.id(type, ...idParts, label),
      type,
      label,
      provenance,
    }
  }

  private newGraph(chain: string, chainId: number): Graph {
    return {
      chain,
      chainId,
      nodes: new Map(),
      edges: [],
      dependenciesCache: new Map(),
      visitedNodeIds: new Set(),
    }
  }

  private async requestTokenDependencies(graph: Graph, token: string): Promise<TokenDependencies> {
    if (!this.llmClient) this.llmClient = LlmClient.create(this.provider)

    const response = await this.llmClient.requestJson<Omit<TokenDependencies, 'source'>>({
      instructions: TOKEN_DEPENDENCIES_PROMPT,
      name: TOKEN_DEPENDENCIES_NAME,
      schema: TOKEN_DEPENDENCIES_SCHEMA,
      payload: {
        chain: graph.chain,
        token,
      },
    })

    recordLlmSuggestion(
      token.trim().toLowerCase(),
      { tokenType: response.tokenType, dependencies: response.dependencies },
      this.provider ?? DEFAULT_LLM_PROVIDER,
      graph.chain,
      new Date().toISOString(),
    )

    return { ...response, source: 'llm' }
  }
}
