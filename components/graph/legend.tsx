"use client"

import { EDGE_TYPE_META, NODE_TYPE_META, type EdgeType, type NodeType } from "@/lib/graph-types"

const NODE_ORDER: NodeType[] = [
  "market",
  "protocol",
  "primitive_token",
  "wrapper",
  "lp",
  "position",
]
const EDGE_ORDER: EdgeType[] = ["loan", "collateral", "protocol", "underlying"]

export function Legend() {
  return (
    <div className="rounded-lg border border-border bg-card/80 p-3 text-xs backdrop-blur-sm">
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Nodes
          </p>
          <ul className="space-y-1.5">
            {NODE_ORDER.map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: NODE_TYPE_META[t].color }}
                />
                <span className="text-card-foreground">{NODE_TYPE_META[t].label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Edges
          </p>
          <ul className="space-y-1.5">
            {EDGE_ORDER.map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span
                  className="h-0.5 w-5 shrink-0 rounded"
                  style={{ backgroundColor: EDGE_TYPE_META[t].color }}
                />
                <span className="text-card-foreground">{EDGE_TYPE_META[t].label}</span>
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span
                className="h-0 w-5 shrink-0 border-t-2 border-dashed"
                style={{ borderColor: "oklch(0.68 0.02 220)" }}
              />
              <span className="text-muted-foreground">via hidden tokens</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
