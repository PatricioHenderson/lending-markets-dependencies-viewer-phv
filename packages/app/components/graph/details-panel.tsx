"use client"

import { X } from "lucide-react"
import {
  EDGE_TYPE_META,
  NODE_TYPE_META,
  type CollateralSupplyMetrics,
  type DependencyGraph,
  type EdgeType,
  type GraphNode,
  type MarketSupplyMetrics,
  type NodeType,
} from "@/lib/graph-types"
import { formatAmount, formatPct, formatUsd } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DetailsPanelProps {
  node: GraphNode
  graph: DependencyGraph
  onClose: () => void
  onSelectNode: (id: string) => void
}

interface EdgeRow {
  otherId: string
  otherLabel: string
  type: EdgeType
}

export function DetailsPanel({ node, graph, onClose, onSelectNode }: DetailsPanelProps) {
  const labelById = new Map(graph.nodes.map((n) => [n.id, n.label]))
  const meta = NODE_TYPE_META[node.type as NodeType]

  const incoming: EdgeRow[] = graph.edges
    .filter((e) => e.to === node.id)
    .map((e) => ({ otherId: e.from, otherLabel: labelById.get(e.from) ?? e.from, type: e.type }))
  const outgoing: EdgeRow[] = graph.edges
    .filter((e) => e.from === node.id)
    .map((e) => ({ otherId: e.to, otherLabel: labelById.get(e.to) ?? e.to, type: e.type }))

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-border bg-card">
      <div className="flex items-start justify-between gap-2 border-b border-border p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: meta?.color }}
            />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {meta?.label ?? node.type}
              {node.id === graph.root ? " · root" : ""}
            </span>
          </div>
          <h2 className="mt-1 truncate text-base font-semibold text-card-foreground" title={node.label}>
            {node.label}
          </h2>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close details</span>
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-5 p-4">
          <Field label="ID">
            <code className="block break-all rounded bg-muted px-2 py-1.5 font-mono text-[11px] text-muted-foreground">
              {node.id}
            </code>
          </Field>

          {node.supplyMetrics && <SupplySection metrics={node.supplyMetrics} />}
          {node.marketSupply && <MarketSupplySection metrics={node.marketSupply} />}

          <EdgeList
            title={`Incoming (${incoming.length})`}
            empty="No incoming edges"
            rows={incoming}
            direction="in"
            onSelectNode={onSelectNode}
          />
          <EdgeList
            title={`Outgoing (${outgoing.length})`}
            empty="No outgoing edges"
            rows={outgoing}
            direction="out"
            onSelectNode={onSelectNode}
          />
        </div>
      </ScrollArea>
    </aside>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  )
}

function SupplySection({ metrics }: { metrics: CollateralSupplyMetrics }) {
  return (
    <Field label="Supply">
      <div className="space-y-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-2 text-xs">
        <SupplyRow
          label="Supplied"
          value={`${formatAmount(metrics.suppliedAmount)} (${formatUsd(metrics.suppliedUsd)})`}
        />
        <SupplyRow
          label="Supply cap"
          value={
            metrics.supplyCapUsedPct === undefined
              ? "No cap"
              : `${formatAmount(metrics.supplyCapAmount)} (${formatPct(metrics.supplyCapUsedPct)} used)`
          }
        />
        <SupplyRow label="Share of market collateral" value={formatPct(metrics.shareOfCollateralPct)} />
      </div>
    </Field>
  )
}

function MarketSupplySection({ metrics }: { metrics: MarketSupplyMetrics }) {
  return (
    <Field label="Total Supply">
      <div className="space-y-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-2 text-xs">
        <SupplyRow
          label="Supplied"
          value={`${formatAmount(metrics.suppliedAmount)} (${formatUsd(metrics.suppliedUsd)})`}
        />
        <SupplyRow
          label="Supply cap"
          value={
            metrics.supplyCapUsedPct === undefined
              ? "No cap"
              : `${formatAmount(metrics.supplyCapAmount)} (${formatPct(metrics.supplyCapUsedPct)} used)`
          }
        />
      </div>
    </Field>
  )
}

function SupplyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-card-foreground">{value}</span>
    </div>
  )
}

function EdgeList({
  title,
  empty,
  rows,
  direction,
  onSelectNode,
}: {
  title: string
  empty: string
  rows: EdgeRow[]
  direction: "in" | "out"
  onSelectNode: (id: string) => void
}) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground/70">{empty}</p>
      ) : (
        <ul className="space-y-1">
          {rows.map((r, i) => (
            <li key={`${r.otherId}-${r.type}-${i}`}>
              <button
                type="button"
                onClick={() => onSelectNode(r.otherId)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted"
              >
                <span
                  className="h-0.5 w-4 shrink-0 rounded"
                  style={{ backgroundColor: EDGE_TYPE_META[r.type].color }}
                />
                <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {direction === "in" ? "←" : "→"} {EDGE_TYPE_META[r.type].label}
                </span>
                <span className="truncate text-card-foreground" title={r.otherLabel}>
                  {r.otherLabel}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
