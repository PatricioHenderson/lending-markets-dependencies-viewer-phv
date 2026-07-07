"use client"

import { useMemo, useState } from "react"
import { ReactFlowProvider } from "@xyflow/react"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { GraphCanvas } from "./graph-canvas"
import { DetailsPanel } from "./details-panel"
import { JsonInputPanel } from "./json-input-panel"
import {
  MarketRequestPanel,
  type MarketGraphLoadRequest,
} from "./market-request-panel"
import { computeVisibleGraph, parseGraph } from "@/lib/graph-filter"
import { SAMPLE_GRAPH, SAMPLE_GRAPH_JSON } from "@/lib/sample-graph"
import { DEFAULT_EDGE_TYPE_VISIBILITY, type DependencyGraph, type EdgeType } from "@/lib/graph-types"
import { Button } from "@/components/ui/button"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export function GraphExplorer() {
  const [rawJson, setRawJson] = useState(SAMPLE_GRAPH_JSON)
  const [graph, setGraph] = useState<DependencyGraph>(SAMPLE_GRAPH)
  const [showProtocols, setShowProtocols] = useState(true)
  const [showTokens, setShowTokens] = useState(true)
  const [edgeTypeVisibility, setEdgeTypeVisibility] = useState<Record<EdgeType, boolean>>(
    DEFAULT_EDGE_TYPE_VISIBILITY,
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [inputOpen, setInputOpen] = useState(true)
  const [loadingMarket, setLoadingMarket] = useState(false)
  const [marketError, setMarketError] = useState<string | null>(null)

  const visible = useMemo(
    () => computeVisibleGraph(graph, { showProtocols, showTokens, edgeTypeVisibility }),
    [graph, showProtocols, showTokens, edgeTypeVisibility],
  )

  const handleToggleEdgeType = (type: EdgeType, value: boolean) => {
    setEdgeTypeVisibility((prev) => ({ ...prev, [type]: value }))
  }

  const selectedNode = useMemo(() => {
    if (!selectedId) return null
    return graph.nodes.find((n) => n.id === selectedId) ?? null
  }, [graph, selectedId])

  const handleApply = (g: DependencyGraph) => {
    setGraph(g)
    setSelectedId(null)
  }

  const handleLoadMarket = async (request: MarketGraphLoadRequest) => {
    setLoadingMarket(true)
    setMarketError(null)

    try {
      const params = new URLSearchParams({
        protocol: request.protocol,
        chainId: request.chainId,
        marketId: request.marketId,
        llm: request.llm,
      })
      const response = await fetch(`${API_BASE_URL}/api/graph?${params.toString()}`)
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(readApiError(payload) || `Backend returned HTTP ${response.status}`)
      }

      const nextJson = JSON.stringify(payload, null, 2)
      const { graph: nextGraph, error } = parseGraph(nextJson)
      if (error || !nextGraph) throw new Error(error || "Backend returned an invalid graph.")

      setRawJson(nextJson)
      handleApply(nextGraph)
    } catch (error) {
      setMarketError(error instanceof Error ? error.message : String(error))
    } finally {
      setLoadingMarket(false)
    }
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
              Lending Market Dependency Graph Explorer
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
            <div className="flex min-h-0 flex-1 flex-col gap-4">
              <MarketRequestPanel
                loading={loadingMarket}
                error={marketError}
                onLoad={handleLoadMarket}
              />
              <div className="h-px shrink-0 bg-border" />
              <div className="min-h-0 flex-1">
                <JsonInputPanel value={rawJson} onChange={setRawJson} onApply={handleApply} />
              </div>
            </div>
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
              edgeTypeVisibility={edgeTypeVisibility}
              onToggleProtocols={setShowProtocols}
              onToggleTokens={setShowTokens}
              onToggleEdgeType={handleToggleEdgeType}
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

function readApiError(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null
  if (!("error" in payload)) return null
  return typeof payload.error === "string" ? payload.error : null
}
