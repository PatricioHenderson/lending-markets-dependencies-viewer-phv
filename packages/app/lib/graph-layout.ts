import dagre from "dagre"
import { type Edge, type Node, MarkerType, Position } from "@xyflow/react"
import { EDGE_TYPE_META, type CollateralSupplyMetrics, type GraphNode, type MarketSupplyMetrics } from "./graph-types"
import type { VisibleGraph } from "./graph-filter"

export const NODE_WIDTH = 180
export const NODE_HEIGHT = 56
export const SUPPLY_NODE_WIDTH = 226
export const SUPPLY_NODE_HEIGHT = 136

export interface FlowNodeData extends Record<string, unknown> {
  label: string
  type: string
  isRoot: boolean
  supplyMetrics?: CollateralSupplyMetrics
  marketSupply?: MarketSupplyMetrics
}

export function nodeSize(n: Pick<GraphNode, "supplyMetrics" | "marketSupply">): { width: number; height: number } {
  return n.supplyMetrics || n.marketSupply
    ? { width: SUPPLY_NODE_WIDTH, height: SUPPLY_NODE_HEIGHT }
    : { width: NODE_WIDTH, height: NODE_HEIGHT }
}

export function layoutGraph(
  visible: VisibleGraph,
  rootId: string,
): { nodes: Node<FlowNodeData>[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: "LR", nodesep: 28, ranksep: 120, marginx: 24, marginy: 24 })

  for (const n of visible.nodes) {
    const size = nodeSize(n)
    g.setNode(n.id, { width: size.width, height: size.height })
  }
  for (const e of visible.edges) {
    g.setEdge(e.source, e.target)
  }

  dagre.layout(g)

  const nodes: Node<FlowNodeData>[] = visible.nodes.map((n) => {
    const pos = g.node(n.id)
    const size = nodeSize(n)
    return {
      id: n.id,
      type: "dependency",
      position: { x: (pos?.x ?? 0) - size.width / 2, y: (pos?.y ?? 0) - size.height / 2 },
      data: {
        label: n.label,
        type: n.type,
        isRoot: n.id === rootId,
        supplyMetrics: n.supplyMetrics,
        marketSupply: n.marketSupply,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }
  })

  const edges: Edge[] = visible.edges.map((e) => {
    const meta = EDGE_TYPE_META[e.type]
    const color = meta.color
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      animated: false,
      label: e.label ?? meta.label,
      labelShowBg: true,
      labelBgPadding: [4, 2],
      labelBgBorderRadius: 4,
      labelStyle: { fill: "oklch(0.68 0.02 220)", fontSize: 10 },
      labelBgStyle: { fill: "oklch(0.21 0.014 230)", opacity: 0.85 },
      style: {
        stroke: color,
        strokeWidth: e.dashed ? 1.5 : 1.75,
        strokeDasharray: e.dashed ? "5 4" : undefined,
        opacity: e.dashed ? 0.7 : 0.9,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
      data: { edgeType: e.type, dashed: e.dashed },
    }
  })

  return { nodes, edges }
}
