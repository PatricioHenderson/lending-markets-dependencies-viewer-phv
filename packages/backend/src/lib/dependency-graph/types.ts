export const DEPENDENCY_EDGE_TYPE_LOAN = 'loan'
export const DEPENDENCY_EDGE_TYPE_COLLATERAL = 'collateral'
export const DEPENDENCY_EDGE_TYPE_PROTOCOL = 'protocol'
export const DEPENDENCY_EDGE_TYPE_UNDERLYING = 'underlying'

export const DEPENDENCY_EDGE_TYPES = [
  DEPENDENCY_EDGE_TYPE_LOAN,
  DEPENDENCY_EDGE_TYPE_COLLATERAL,
  DEPENDENCY_EDGE_TYPE_PROTOCOL,
  DEPENDENCY_EDGE_TYPE_UNDERLYING,
] as const

export const DEPENDENCY_NODE_TYPE_MARKET = 'market'
export const DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN = 'primitive_token'
export const DEPENDENCY_NODE_TYPE_PROTOCOL = 'protocol'
export const DEPENDENCY_NODE_TYPE_WRAPPER = 'wrapper'
export const DEPENDENCY_NODE_TYPE_LP = 'lp'
export const DEPENDENCY_NODE_TYPE_POSITION = 'position'

export const DEPENDENCY_LEAF_NODE_TYPES = [
  DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN,
  DEPENDENCY_NODE_TYPE_PROTOCOL,
] as const

export const DEPENDENCY_NODE_TYPES = [
  DEPENDENCY_NODE_TYPE_MARKET,
  ...DEPENDENCY_LEAF_NODE_TYPES,
  DEPENDENCY_NODE_TYPE_WRAPPER,
  DEPENDENCY_NODE_TYPE_LP,
  DEPENDENCY_NODE_TYPE_POSITION,
] as const

export type DependencyEdgeType = typeof DEPENDENCY_EDGE_TYPES[number]

export type DependencyNodeType = typeof DEPENDENCY_NODE_TYPES[number]

export interface DependencyGraph {
  root: string
  nodes: DependencyNode[]
  edges: DependencyEdge[]
}

export interface DependencyNode {
  id: string
  type: DependencyNodeType
  label: string
}

export interface DependencyEdge {
  from: string
  to: string
  type: DependencyEdgeType
}

export type ReportGraphInput = {
  market: string
  protocol: string
  loan?: string
  collaterals: string[]
}

export type TokenDependency = {
  label: string
  kind: DependencyNodeType
}

export type TokenDependencies = {
  symbol: string
  tokenType: DependencyNodeType
  dependencies: TokenDependency[]
}

export type TokenDependenciesResponse = TokenDependencies

export type DependenciesCache = Map<string, Promise<TokenDependencies>>

export type Graph = {
  chain: string
  nodes: Map<string, DependencyNode>
  edges: DependencyEdge[]
  dependenciesCache: DependenciesCache
  visitedNodeIds: Set<string>
}
