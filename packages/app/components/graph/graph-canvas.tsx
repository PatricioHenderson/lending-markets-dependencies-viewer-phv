"use client"

import { useCallback, useEffect, useMemo } from "react"
import {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  type Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Crosshair, Maximize2 } from "lucide-react"
import { DependencyNode } from "./dependency-node"
import { Legend } from "./legend"
import { layoutGraph, type FlowNodeData } from "@/lib/graph-layout"
import type { VisibleGraph } from "@/lib/graph-filter"
import { EDGE_TYPE_META, EDGE_TYPES, type EdgeType } from "@/lib/graph-types"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const nodeTypes = { dependency: DependencyNode }

interface GraphCanvasProps {
  visible: VisibleGraph
  rootId: string
  selectedId: string | null
  showProtocols: boolean
  showTokens: boolean
  edgeTypeVisibility: Record<EdgeType, boolean>
  onToggleProtocols: (v: boolean) => void
  onToggleTokens: (v: boolean) => void
  onToggleEdgeType: (type: EdgeType, v: boolean) => void
  onNodeClick: (id: string) => void
}

export function GraphCanvas(props: GraphCanvasProps) {
  const {
    visible,
    rootId,
    selectedId,
    showProtocols,
    showTokens,
    edgeTypeVisibility,
    onToggleProtocols,
    onToggleTokens,
    onToggleEdgeType,
    onNodeClick,
  } = props

  const { fitView, setCenter, getNode } = useReactFlow()

  const layout = useMemo(() => layoutGraph(visible, rootId), [visible, rootId])

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<FlowNodeData>>(layout.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(layout.edges)

  // Re-apply layout whenever the visible graph changes.
  useEffect(() => {
    setNodes(layout.nodes)
    setEdges(layout.edges)
    const id = window.setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 })
    }, 50)
    return () => window.clearTimeout(id)
  }, [layout, setNodes, setEdges, fitView])

  // Reflect selection styling.
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({ ...n, selected: n.id === selectedId })),
    )
  }, [selectedId, setNodes])

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => onNodeClick(node.id),
    [onNodeClick],
  )

  const focusRoot = useCallback(() => {
    const node = getNode(rootId)
    if (node) {
      setCenter(node.position.x + 90, node.position.y + 28, { zoom: 1, duration: 400 })
    } else {
      fitView({ padding: 0.2, duration: 400 })
    }
  }, [getNode, rootId, setCenter, fitView])

  return (
    <div className="relative h-full w-full">
      {/* Toolbar */}
      <div className="absolute left-4 top-4 z-10 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-4 rounded-lg border border-border bg-card/85 px-4 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Switch id="toggle-protocols" checked={showProtocols} onCheckedChange={onToggleProtocols} />
            <Label htmlFor="toggle-protocols" className="cursor-pointer text-xs text-card-foreground">
              Protocols
            </Label>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Switch id="toggle-tokens" checked={showTokens} onCheckedChange={onToggleTokens} />
            <Label htmlFor="toggle-tokens" className="cursor-pointer text-xs text-card-foreground">
              Tokens
            </Label>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card/85 px-4 py-2 backdrop-blur-sm">
          {EDGE_TYPES.map((type) => (
            <div key={type} className="flex items-center gap-1.5">
              <Switch
                id={`toggle-edge-${type}`}
                checked={edgeTypeVisibility[type]}
                onCheckedChange={(v) => onToggleEdgeType(type, v)}
              />
              <Label htmlFor={`toggle-edge-${type}`} className="cursor-pointer text-xs text-card-foreground">
                {EDGE_TYPE_META[type].label}
              </Label>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card/85 px-2 py-1.5 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() => fitView({ padding: 0.2, duration: 400 })}
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Fit
          </Button>
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={focusRoot}>
            <Crosshair className="h-3.5 w-3.5" />
            Reset view
          </Button>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-10 w-72 max-w-[80%]">
        <Legend />
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: "default" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="oklch(0.3 0.015 230)" />
        <Controls
          showInteractive={false}
          className="!border-border !bg-card [&_button]:!border-border [&_button]:!bg-card [&_button]:!fill-foreground [&_button:hover]:!bg-muted"
        />
      </ReactFlow>
    </div>
  )
}
