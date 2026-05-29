"use client"

import { useMemo, useState } from "react"
import { ReactFlowProvider } from "@xyflow/react"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { GraphCanvas } from "./graph-canvas"
import { DetailsPanel } from "./details-panel"
import { JsonInputPanel } from "./json-input-panel"
import { computeVisibleGraph } from "@/lib/graph-filter"
import { SAMPLE_GRAPH, SAMPLE_GRAPH_JSON } from "@/lib/sample-graph"
import type { DependencyGraph } from "@/lib/graph-types"
import { Button } from "@/components/ui/button"

export function GraphExplorer() {
  const [rawJson, setRawJson] = useState(SAMPLE_GRAPH_JSON)
  const [graph, setGraph] = useState<DependencyGraph>(SAMPLE_GRAPH)
  const [showProtocols, setShowProtocols] = useState(true)
  const [showTokens, setShowTokens] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [inputOpen, setInputOpen] = useState(true)

  const visible = useMemo(
    () => computeVisibleGraph(graph, { showProtocols, showTokens }),
    [graph, showProtocols, showTokens],
  )

  const selectedNode = useMemo(() => {
    if (!selectedId) return null
    return graph.nodes.find((n) => n.id === selectedId) ?? null
  }, [graph, selectedId])

  const handleApply = (g: DependencyGraph) => {
    setGraph(g)
    setSelectedId(null)
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setInputOpen((v) => !v)}
            aria-label={inputOpen ? "Hide JSON panel" : "Show JSON panel"}
          >
            {inputOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </Button>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
            <h1 className="text-sm font-semibold tracking-tight text-foreground">
              DeFi Dependency Graph Explorer
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            {visible.nodes.length} <span className="text-muted-foreground/60">/ {graph.nodes.length} nodes</span>
          </span>
          <span>{visible.edges.length} edges</span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Input panel */}
        {inputOpen && (
          <div className="flex w-80 shrink-0 flex-col border-r border-border bg-card p-4">
            <JsonInputPanel value={rawJson} onChange={setRawJson} onApply={handleApply} />
          </div>
        )}

        {/* Canvas */}
        <main className="relative min-w-0 flex-1">
          <ReactFlowProvider>
            <GraphCanvas
              visible={visible}
              rootId={graph.root}
              selectedId={selectedId}
              showProtocols={showProtocols}
              showTokens={showTokens}
              onToggleProtocols={setShowProtocols}
              onToggleTokens={setShowTokens}
              onNodeClick={setSelectedId}
            />
          </ReactFlowProvider>
        </main>

        {/* Details */}
        {selectedNode && (
          <DetailsPanel
            node={selectedNode}
            graph={graph}
            onClose={() => setSelectedId(null)}
            onSelectNode={(id) => setSelectedId(id)}
          />
        )}
      </div>
    </div>
  )
}
