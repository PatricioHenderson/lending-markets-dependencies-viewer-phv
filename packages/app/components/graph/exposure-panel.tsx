"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { computeAggregateExposure, type ExposureEntry } from "@/lib/graph-exposure"
import { formatPct, formatUsd } from "@/lib/format"
import type { DependencyGraph } from "@/types/graph"

interface ExposurePanelProps {
  graph: DependencyGraph
}

export function ExposurePanel({ graph }: ExposurePanelProps) {
  const [open, setOpen] = useState(false)
  const result = useMemo(() => computeAggregateExposure(graph), [graph])

  return (
    <div className="w-80 max-w-[85vw] rounded-lg border border-border bg-card/85 text-xs backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-card-foreground"
      >
        <span className="font-semibold">Aggregate exposure</span>
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {open && (
        <div className="max-h-96 space-y-4 overflow-y-auto border-t border-border p-3">
          <ExposureTable title="By asset" entries={result.byAsset} />
          <ExposureTable title="By protocol" entries={result.byProtocol} />
        </div>
      )}
    </div>
  )
}

function ExposureTable({ title, entries }: { title: string; entries: ExposureEntry[] }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {entries.length === 0 ? (
        <p className="text-muted-foreground/70">No exposure data.</p>
      ) : (
        <ul className="space-y-1">
          {entries.map((e) => (
            <li key={e.nodeId} className="flex items-center justify-between gap-2">
              <span className="truncate text-card-foreground" title={e.label}>
                {e.label}
              </span>
              <span className="shrink-0 text-muted-foreground">
                {formatUsd(e.exposureUsd)} · {formatPct(e.pctOfCollateral)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
