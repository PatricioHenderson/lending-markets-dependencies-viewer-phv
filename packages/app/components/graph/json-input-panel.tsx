"use client"

import { useState } from "react"
import { AlertCircle, Check, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { parseGraph } from "@/lib/graph-filter"
import { SAMPLE_GRAPH_JSON } from "@/lib/sample-graph"
import type { DependencyGraph } from "@/types/graph"

interface JsonInputPanelProps {
  value: string
  onChange: (value: string) => void
  onApply: (graph: DependencyGraph) => void
}

export function JsonInputPanel({ value, onChange, onApply }: JsonInputPanelProps) {
  const [error, setError] = useState<string | null>(null)
  const [applied, setApplied] = useState(false)

  const handleApply = () => {
    const { graph, error: parseError } = parseGraph(value)
    if (parseError || !graph) {
      setError(parseError)
      setApplied(false)
      return
    }
    setError(null)
    setApplied(true)
    onApply(graph)
    setTimeout(() => setApplied(false), 1500)
  }

  const handleReset = () => {
    onChange(SAMPLE_GRAPH_JSON)
    setError(null)
    const { graph } = parseGraph(SAMPLE_GRAPH_JSON)
    if (graph) onApply(graph)
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-card-foreground">Graph JSON</h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-muted-foreground"
          onClick={handleReset}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Sample
        </Button>
      </div>

      <Textarea
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-0 flex-1 resize-none bg-background font-mono text-[11px] leading-relaxed"
        placeholder="Paste dependency graph JSON here…"
        aria-label="Graph JSON input"
      />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive-foreground"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
          <span className="text-destructive">{error}</span>
        </div>
      )}

      <Button onClick={handleApply} className="gap-1.5">
        {applied ? (
          <>
            <Check className="h-4 w-4" /> Rendered
          </>
        ) : (
          "Render graph"
        )}
      </Button>
    </div>
  )
}
