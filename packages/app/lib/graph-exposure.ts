import type { DependencyGraph, NodeType } from "@/types/graph"

export interface ExposureEntry {
  nodeId: string
  label: string
  type: NodeType
  exposureUsd: number
  pctOfCollateral: number
}

export interface ExposureResult {
  totalCollateralUsd: number
  byAsset: ExposureEntry[]
  byProtocol: ExposureEntry[]
}

const TRAVERSAL_EDGE_TYPES = new Set(["underlying", "protocol"])

/**
 * exposure(E) = Σ suppliedUsd of every direct collateral (a node with supplyMetrics) from
 * which E is reachable via outgoing underlying/protocol edges. Not a partition: the same
 * collateral's USD counts toward every entity it's exposed to. A collateral counts as
 * reachable from itself (distance 0), so it always appears in its own exposure entry.
 */
export function computeAggregateExposure(graph: DependencyGraph): ExposureResult {
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]))

  const outAdj = new Map<string, string[]>()
  for (const edge of graph.edges) {
    if (!TRAVERSAL_EDGE_TYPES.has(edge.type)) continue
    if (!outAdj.has(edge.from)) outAdj.set(edge.from, [])
    outAdj.get(edge.from)!.push(edge.to)
  }

  const collaterals = graph.nodes.filter((n) => n.supplyMetrics)
  const totalCollateralUsd = collaterals.reduce((sum, n) => sum + n.supplyMetrics!.suppliedUsd, 0)

  const exposureUsdById = new Map<string, number>()

  for (const collateral of collaterals) {
    const suppliedUsd = collateral.supplyMetrics!.suppliedUsd

    const reached = new Set<string>([collateral.id])
    const queue = [collateral.id]
    while (queue.length) {
      const current = queue.shift()!
      for (const next of outAdj.get(current) ?? []) {
        if (reached.has(next)) continue
        reached.add(next)
        queue.push(next)
      }
    }

    for (const nodeId of reached) {
      exposureUsdById.set(nodeId, (exposureUsdById.get(nodeId) ?? 0) + suppliedUsd)
    }
  }

  const entries: ExposureEntry[] = []
  for (const [nodeId, exposureUsd] of exposureUsdById) {
    const node = nodeById.get(nodeId)
    if (!node) continue
    entries.push({
      nodeId,
      label: node.label,
      type: node.type,
      exposureUsd,
      pctOfCollateral: totalCollateralUsd > 0 ? (exposureUsd / totalCollateralUsd) * 100 : 0,
    })
  }

  const byAsset = entries.filter((e) => e.type !== "protocol").sort((a, b) => b.exposureUsd - a.exposureUsd)
  const byProtocol = entries.filter((e) => e.type === "protocol").sort((a, b) => b.exposureUsd - a.exposureUsd)

  return { totalCollateralUsd, byAsset, byProtocol }
}
