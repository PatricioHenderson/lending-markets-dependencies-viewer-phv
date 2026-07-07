import {
  type CollateralSupplyMetrics,
  type DependencyGraph,
  type EdgeType,
  type GraphNode,
  TOKEN_LIKE_TYPES,
} from "./graph-types"

const VALID_NODE_TYPES = new Set([
  "market",
  "protocol",
  "primitive_token",
  "wrapper",
  "lp",
  "position",
])
const VALID_EDGE_TYPES = new Set(["loan", "collateral", "protocol", "underlying"])

export interface ParseResult {
  graph: DependencyGraph | null
  error: string | null
}

/** Best-effort parse of optional per-node supply metrics; malformed input is dropped, not fatal. */
function parseSupplyMetrics(value: unknown): CollateralSupplyMetrics | undefined {
  if (typeof value !== "object" || value === null) return undefined
  const m = value as Record<string, unknown>
  if (typeof m.suppliedAmount !== "string") return undefined
  if (typeof m.supplyCapAmount !== "string") return undefined
  if (typeof m.suppliedUsd !== "number") return undefined
  if (typeof m.shareOfCollateralPct !== "number") return undefined

  return {
    suppliedAmount: m.suppliedAmount,
    supplyCapAmount: m.supplyCapAmount,
    supplyCapUsedPct: typeof m.supplyCapUsedPct === "number" ? m.supplyCapUsedPct : undefined,
    suppliedUsd: m.suppliedUsd,
    shareOfCollateralPct: m.shareOfCollateralPct,
  }
}

/** Parse + validate a graph JSON string. */
export function parseGraph(input: string): ParseResult {
  let data: unknown
  try {
    data = JSON.parse(input)
  } catch (e) {
    return { graph: null, error: `Invalid JSON: ${(e as Error).message}` }
  }

  if (typeof data !== "object" || data === null) {
    return { graph: null, error: "Top-level value must be an object." }
  }
  const obj = data as Record<string, unknown>

  if (typeof obj.root !== "string" || obj.root.length === 0) {
    return { graph: null, error: '"root" must be a non-empty string.' }
  }
  if (!Array.isArray(obj.nodes)) {
    return { graph: null, error: '"nodes" must be an array.' }
  }
  if (!Array.isArray(obj.edges)) {
    return { graph: null, error: '"edges" must be an array.' }
  }

  const nodes: GraphNode[] = []
  const ids = new Set<string>()
  for (let i = 0; i < obj.nodes.length; i++) {
    const n = obj.nodes[i] as Record<string, unknown>
    if (!n || typeof n.id !== "string") {
      return { graph: null, error: `nodes[${i}]: missing string "id".` }
    }
    if (typeof n.type !== "string" || !VALID_NODE_TYPES.has(n.type)) {
      return {
        graph: null,
        error: `nodes[${i}] ("${n.id}"): invalid type "${String(n.type)}".`,
      }
    }
    if (typeof n.label !== "string") {
      return { graph: null, error: `nodes[${i}] ("${n.id}"): missing string "label".` }
    }
    if (ids.has(n.id)) {
      return { graph: null, error: `Duplicate node id "${n.id}".` }
    }
    ids.add(n.id)
    const supplyMetrics = parseSupplyMetrics(n.supplyMetrics)
    nodes.push({
      id: n.id,
      type: n.type as GraphNode["type"],
      label: n.label,
      ...(supplyMetrics ? { supplyMetrics } : {}),
    })
  }

  if (!ids.has(obj.root)) {
    return { graph: null, error: `Root "${obj.root}" is not present in nodes.` }
  }

  const edges = []
  for (let i = 0; i < obj.edges.length; i++) {
    const e = obj.edges[i] as Record<string, unknown>
    if (!e || typeof e.from !== "string" || typeof e.to !== "string") {
      return { graph: null, error: `edges[${i}]: requires string "from" and "to".` }
    }
    if (typeof e.type !== "string" || !VALID_EDGE_TYPES.has(e.type)) {
      return {
        graph: null,
        error: `edges[${i}]: invalid type "${String(e.type)}".`,
      }
    }
    if (!ids.has(e.from)) {
      return { graph: null, error: `edges[${i}]: unknown "from" node "${e.from}".` }
    }
    if (!ids.has(e.to)) {
      return { graph: null, error: `edges[${i}]: unknown "to" node "${e.to}".` }
    }
    edges.push({ from: e.from, to: e.to, type: e.type as EdgeType })
  }

  return { graph: { root: obj.root, nodes, edges }, error: null }
}

export interface VisibleEdge {
  id: string
  source: string
  target: string
  type: EdgeType
  dashed: boolean
  label?: string
}

export interface FilterOptions {
  showProtocols: boolean
  showTokens: boolean
  edgeTypeVisibility: Record<EdgeType, boolean>
}

export interface VisibleGraph {
  nodes: GraphNode[]
  edges: VisibleEdge[]
}

const TOKEN_SET = new Set<string>(TOKEN_LIKE_TYPES)

/**
 * Produce the visible graph given filter options.
 * - Edges whose type is disabled in edgeTypeVisibility are not traversed at all.
 * - Hidden protocols / token-like nodes are removed (root never hidden).
 * - Only nodes reachable from root through visible nodes/edges (or hidden node chains) are kept.
 * - A visible node reachable only through hidden nodes is connected to its nearest
 *   visible ancestor with a dashed edge ("via hidden tokens" when crossing token nodes).
 */
export function computeVisibleGraph(
  graph: DependencyGraph,
  { showProtocols, showTokens, edgeTypeVisibility }: FilterOptions,
): VisibleGraph {
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]))
  const outAdj = new Map<string, { to: string; type: EdgeType }[]>()
  for (const e of graph.edges) {
    if (!edgeTypeVisibility[e.type]) continue
    if (!outAdj.has(e.from)) outAdj.set(e.from, [])
    outAdj.get(e.from)!.push({ to: e.to, type: e.type })
  }

  const isHidden = (node: GraphNode): boolean => {
    if (node.id === graph.root) return false
    if (node.type === "protocol" && !showProtocols) return true
    if (TOKEN_SET.has(node.type) && !showTokens) return true
    return false
  }

  const visibleNodeIds = new Set<string>()
  const visibleEdges: VisibleEdge[] = []
  const seenEdgeKeys = new Set<string>()

  const addEdge = (
    source: string,
    target: string,
    type: EdgeType,
    dashed: boolean,
    label?: string,
  ) => {
    const key = dashed ? `d:${source}->${target}` : `${source}->${target}:${type}`
    if (seenEdgeKeys.has(key)) return
    seenEdgeKeys.add(key)
    visibleEdges.push({ id: key, source, target, type, dashed, label })
  }

  // Expand from a visible node, walking through hidden nodes to find next visible targets.
  const expand = (visibleId: string): string[] => {
    const discovered: string[] = []
    const localSeen = new Set<string>()
    const stack: { to: string; type: EdgeType; crossedToken: boolean }[] = (
      outAdj.get(visibleId) ?? []
    ).map((e) => ({ ...e, crossedToken: false }))

    while (stack.length) {
      const { to, type, crossedToken } = stack.pop()!
      const toNode = nodeById.get(to)
      if (!toNode) continue

      if (!isHidden(toNode)) {
        addEdge(
          visibleId,
          to,
          type,
          crossedToken,
          crossedToken ? "via hidden tokens" : undefined,
        )
        discovered.push(to)
        continue
      }
      // hidden: continue traversal through it
      if (localSeen.has(to)) continue
      localSeen.add(to)
      const nowCrossedToken = crossedToken || TOKEN_SET.has(toNode.type)
      for (const next of outAdj.get(to) ?? []) {
        stack.push({ to: next.to, type: next.type, crossedToken: nowCrossedToken })
      }
    }
    return discovered
  }

  // BFS over visible nodes starting from root.
  const queue: string[] = [graph.root]
  visibleNodeIds.add(graph.root)
  while (queue.length) {
    const current = queue.shift()!
    const targets = expand(current)
    for (const t of targets) {
      if (!visibleNodeIds.has(t)) {
        visibleNodeIds.add(t)
        queue.push(t)
      }
    }
  }

  const nodes = graph.nodes.filter((n) => visibleNodeIds.has(n.id))
  const edges = visibleEdges.filter(
    (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target),
  )
  return { nodes, edges }
}
