export const DEPENDENCY_EDGE_TYPE_LOAN = 'loan'
export const DEPENDENCY_EDGE_TYPE_COLLATERAL = 'collateral'
export const DEPENDENCY_EDGE_TYPE_PROTOCOL = 'protocol'
export const DEPENDENCY_EDGE_TYPE_UNDERLYING = 'underlying'

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

export type DependencyEdgeType =
  | typeof DEPENDENCY_EDGE_TYPE_LOAN
  | typeof DEPENDENCY_EDGE_TYPE_COLLATERAL
  | typeof DEPENDENCY_EDGE_TYPE_PROTOCOL
  | typeof DEPENDENCY_EDGE_TYPE_UNDERLYING

export type DependencyNodeType = typeof DEPENDENCY_NODE_TYPES[number]

export interface DependencyGraph {
  root: string
  nodes: DependencyNode[]
  edges: DependencyEdge[]
}

export type Provenance = 'api' | 'curated' | 'llm'

export interface DependencyNode {
  id: string
  type: DependencyNodeType
  label: string
  provenance: Provenance
  supplyMetrics?: CollateralSupplyMetrics
  marketSupply?: MarketSupplyMetrics
}

export type MarketSupplyMetrics = {
  suppliedAmount: string
  supplyCapAmount: string
  supplyCapUsedPct?: number
  suppliedUsd: number
}

export type CollateralSupplyMetrics = MarketSupplyMetrics & {
  shareOfCollateralPct: number
  maxLtvPct: number
  liquidationThresholdPct: number
  liquidationBonusPct: number
  isFrozen: boolean
  isPaused: boolean
}

export interface DependencyEdge {
  from: string
  to: string
  type: DependencyEdgeType
  provenance: Provenance
}

export type DependencyGraphInput = {
  market: string
  protocol: string
  loan?: string
  collaterals: string[]
  collateralMetrics?: Record<string, CollateralSupplyMetrics>
  marketSupply?: MarketSupplyMetrics
}

export type TokenDependency = {
  label: string
  kind: DependencyNodeType
}

export type TokenDependencies = {
  symbol: string
  tokenType: DependencyNodeType
  dependencies: TokenDependency[]
  source: 'curated' | 'llm'
}

export type DependenciesCache = Map<string, Promise<TokenDependencies>>

export type Graph = {
  chain: string
  nodes: Map<string, DependencyNode>
  edges: DependencyEdge[]
  dependenciesCache: DependenciesCache
  visitedNodeIds: Set<string>
}

export type MarketProtocol = 'aave-v3' | 'morpho' | 'spark' | 'maple'

export type MarketGraphRequest = {
  protocol: string
  chainId: string | number
  marketId: string
  llm?: string
}

export type SupportedProtocol = {
  id: MarketProtocol
  label: string
  chains: Array<{ id: number; network: string }>
}

export type GraphQLVariables = Record<string, unknown>

export type GraphQLErrorResponse = {
  message: string
}

export type GraphQLResponse<TData> = {
  data?: TData
  errors?: GraphQLErrorResponse[]
}
