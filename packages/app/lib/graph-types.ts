export type NodeType =
  | "market"
  | "protocol"
  | "primitive_token"
  | "wrapper"
  | "lp"
  | "position"

export type EdgeType = "loan" | "collateral" | "protocol" | "underlying"

export interface MarketSupplyMetrics {
  suppliedAmount: string
  supplyCapAmount: string
  supplyCapUsedPct?: number
  suppliedUsd: number
}

export interface CollateralSupplyMetrics extends MarketSupplyMetrics {
  shareOfCollateralPct: number
  maxLtvPct: number
  liquidationThresholdPct: number
  liquidationBonusPct: number
  isFrozen: boolean
  isPaused: boolean
}

export type Provenance = "api" | "curated" | "llm"

export interface GraphNode {
  id: string
  type: NodeType
  label: string
  provenance?: Provenance
  supplyMetrics?: CollateralSupplyMetrics
  marketSupply?: MarketSupplyMetrics
}

export interface GraphEdge {
  from: string
  to: string
  type: EdgeType
  provenance?: Provenance
}

export interface DependencyGraph {
  root: string
  nodes: GraphNode[]
  edges: GraphEdge[]
}

// Node types considered "token-like" (hidden when toggling tokens off, except root).
export const TOKEN_LIKE_TYPES: NodeType[] = [
  "primitive_token",
  "wrapper",
  "lp",
  "position",
  "market",
]

export const NODE_TYPE_META: Record<
  NodeType,
  { label: string; color: string; description: string }
> = {
  market: { label: "Market", color: "#22d3ee", description: "Lending market" },
  protocol: { label: "Protocol", color: "#818cf8", description: "Protocol / issuer" },
  primitive_token: { label: "Primitive Token", color: "#94a3b8", description: "Base asset" },
  wrapper: { label: "Wrapper", color: "#2dd4bf", description: "Wrapped / derivative token" },
  lp: { label: "LP", color: "#4ade80", description: "Liquidity position" },
  position: { label: "Position", color: "#fbbf24", description: "Structured position" },
}

export const EDGE_TYPE_META: Record<
  EdgeType,
  { label: string; color: string }
> = {
  loan: { label: "Loan", color: "#22d3ee" },
  collateral: { label: "Collateral", color: "#34d399" },
  protocol: { label: "Protocol", color: "#818cf8" },
  underlying: { label: "Underlying", color: "#5eead4" },
}

export const EDGE_TYPES: EdgeType[] = ["loan", "collateral", "protocol", "underlying"]

export const DEFAULT_EDGE_TYPE_VISIBILITY: Record<EdgeType, boolean> = {
  loan: true,
  collateral: true,
  protocol: true,
  underlying: true,
}
