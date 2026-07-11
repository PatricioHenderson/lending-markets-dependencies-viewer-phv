"use client"

import { useEffect, useState } from "react"
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
  type Provenance,
} from "@/types/graph"
import type { ContractControlMetadata } from "@/types/inspector"
import { formatAmount, formatPct, formatUsd } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

const DATA_SOURCE_LABEL: Record<Provenance, string> = {
  api: "Protocol API",
  curated: "Curated registry",
  llm: "LLM-inferred (unverified)",
}

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

  const [inspection, setInspection] = useState<ContractControlMetadata | null>(null)
  const [inspectLoading, setInspectLoading] = useState(false)
  const [inspectError, setInspectError] = useState<string | null>(null)

  useEffect(() => {
    setInspection(null)
    setInspectError(null)

    if (!node.address || graph.chainId === undefined) return

    let cancelled = false
    setInspectLoading(true)

    const params = new URLSearchParams({ chainId: String(graph.chainId), address: node.address })
    fetch(`${API_BASE_URL}/api/inspect?${params.toString()}`)
      .then(async (response) => {
        const payload = await response.json().catch(() => null)
        if (!response.ok) throw new Error(readApiError(payload) || `Backend returned HTTP ${response.status}`)
        if (!cancelled) setInspection(payload as ContractControlMetadata)
      })
      .catch((error: unknown) => {
        if (!cancelled) setInspectError(error instanceof Error ? error.message : String(error))
      })
      .finally(() => {
        if (!cancelled) setInspectLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [node.address, graph.chainId])

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

          {node.address && (
            <Field label="Address">
              <code
                className="block truncate rounded bg-muted px-2 py-1.5 font-mono text-[11px] text-muted-foreground"
                title={node.address}
              >
                {node.address}
              </code>
            </Field>
          )}

          {node.provenance && (
            <Field label="Data source">
              <p className="text-xs text-card-foreground">{DATA_SOURCE_LABEL[node.provenance]}</p>
            </Field>
          )}

          {node.supplyMetrics && <SupplySection metrics={node.supplyMetrics} />}
          {node.marketSupply && <MarketSupplySection metrics={node.marketSupply} />}
          {node.supplyMetrics && <CollateralParametersSection metrics={node.supplyMetrics} />}

          {node.address && (
            <ControlSection loading={inspectLoading} error={inspectError} data={inspection} />
          )}

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

function CollateralParametersSection({ metrics }: { metrics: CollateralSupplyMetrics }) {
  const flags = [
    metrics.isFrozen ? "Frozen" : null,
    metrics.isPaused ? "Paused" : null,
  ].filter(Boolean) as string[]

  return (
    <Field label="Collateral Parameters">
      <div className="space-y-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-2 text-xs">
        <SupplyRow label="Max LTV" value={`${metrics.maxLtvPct.toFixed(2)}%`} />
        <SupplyRow label="Liquidation threshold" value={`${metrics.liquidationThresholdPct.toFixed(2)}%`} />
        <SupplyRow label="Liquidation bonus" value={`${metrics.liquidationBonusPct.toFixed(2)}%`} />
        {flags.length > 0 && (
          <div className="mt-1 flex items-center gap-1.5 rounded border border-destructive/40 bg-destructive/10 px-2 py-1 text-destructive-foreground">
            <span className="font-semibold">⚠ {flags.join(" · ")}</span>
          </div>
        )}
      </div>
    </Field>
  )
}

const CAPABILITY_LABELS: Array<{ key: keyof ContractControlMetadata["capabilities"]; label: string }> = [
  { key: "pausable", label: "Pausable" },
  { key: "mintable", label: "Mintable" },
  { key: "blacklist", label: "Blacklist" },
]

function describeControlStep(step: ContractControlMetadata["controlChain"][number]): string {
  if (step.type === "safe") return `Safe ${step.threshold}/${step.owners}`
  if (step.type === "timelock") return `Timelock (${(step.delaySeconds / 3600).toFixed(1)}h)`
  if (step.type === "proxy-admin") return "ProxyAdmin"
  if (step.type === "eoa") return "EOA"
  return "Contract"
}

function ControlSection({
  loading,
  error,
  data,
}: {
  loading: boolean
  error: string | null
  data: ContractControlMetadata | null
}) {
  return (
    <Field label="Control">
      <div className="space-y-2 rounded-md border border-border bg-muted/40 px-2.5 py-2 text-xs">
        {loading && <p className="text-muted-foreground">Inspecting contract…</p>}
        {error && !loading && <p className="text-destructive-foreground">Failed to inspect: {error}</p>}
        {data && !loading && !error && (
          <>
            <p className="text-card-foreground">
              {data.isProxy ? `Upgradeable proxy (${data.proxyType ?? "unknown"})` : "Not a proxy"}
            </p>

            {data.controlChain.length > 0 && (
              <p className="text-card-foreground">{data.controlChain.map(describeControlStep).join(" → ")}</p>
            )}

            <div className="flex flex-wrap gap-1.5">
              {CAPABILITY_LABELS.filter(({ key }) => data.capabilities[key]).map(({ key, label }) => (
                <span
                  key={key}
                  className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400"
                >
                  {label}
                </span>
              ))}
            </div>

            {data.controlChain.some((step) => step.type === "eoa") && (
              <div className="rounded border border-destructive/40 bg-destructive/10 px-2 py-1 text-destructive-foreground">
                <span className="font-semibold">⚠ Controlled by a single EOA key</span>
              </div>
            )}
            {data.paused === true && (
              <div className="rounded border border-destructive/40 bg-destructive/10 px-2 py-1 text-destructive-foreground">
                <span className="font-semibold">⚠ Contract is paused</span>
              </div>
            )}
          </>
        )}
      </div>
    </Field>
  )
}

function readApiError(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null
  if (!("error" in payload)) return null
  return typeof payload.error === "string" ? payload.error : null
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
