"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { NODE_TYPE_META, type MarketSupplyMetrics, type NodeType } from "@/types/graph"
import { formatAmount, formatPct, formatUsd } from "@/lib/format"
import { NODE_HEIGHT, NODE_WIDTH, SUPPLY_NODE_HEIGHT, SUPPLY_NODE_WIDTH, type FlowNodeData } from "@/lib/graph-layout"
import { cn } from "@/lib/utils"

function DependencyNodeComponent({ data, selected }: NodeProps) {
  const d = data as FlowNodeData
  const meta = NODE_TYPE_META[d.type as NodeType]
  const color = meta?.color ?? "#94a3b8"
  const isRoot = d.isRoot
  const isUnverified = d.provenance === "llm"
  const riskFlag = d.supplyMetrics?.isFrozen ? "Frozen" : d.supplyMetrics?.isPaused ? "Paused" : undefined
  const metrics: MarketSupplyMetrics | undefined = d.supplyMetrics ?? d.marketSupply
  const shareOfCollateralPct = d.supplyMetrics?.shareOfCollateralPct

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-md border bg-card/90 px-3 py-2 backdrop-blur-sm transition-shadow",
        isRoot ? "border-2" : "border",
        isUnverified ? "border-dashed" : "",
        selected ? "ring-2 ring-offset-1 ring-offset-background" : "",
      )}
      style={{
        width: metrics ? SUPPLY_NODE_WIDTH : NODE_WIDTH,
        height: metrics ? SUPPLY_NODE_HEIGHT : NODE_HEIGHT,
        borderColor: color,
        boxShadow: isRoot ? `0 0 0 1px ${color}, 0 0 18px ${color}55` : undefined,
        // @ts-expect-error css var for ring
        "--tw-ring-color": color,
      }}
    >
      {isUnverified && (
        <span className="absolute -top-2 -left-2 rounded-full border border-amber-500/40 bg-amber-500/15 px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
          Unverified
        </span>
      )}
      {riskFlag && (
        <span
          className="absolute -top-2 -right-2 rounded-full border border-destructive/60 bg-destructive/90 px-1.5 py-0.5 text-[9px] font-semibold leading-none text-destructive-foreground shadow-sm"
          title={`This reserve is ${riskFlag.toLowerCase()} by governance`}
        >
          ⚠ {riskFlag}
        </span>
      )}
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-0 !bg-muted-foreground" />
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
        <span className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
          {meta?.label ?? d.type}
          {isRoot ? " · root" : ""}
        </span>
      </div>
      <span
        className="mt-0.5 truncate text-sm font-medium text-card-foreground"
        title={d.label}
      >
        {d.label}
      </span>
      {metrics && (
        <div className="mt-1.5 space-y-1 border-t border-border/60 pt-1.5 text-[9px] leading-tight">
          <MetricRow
            label="Supplied"
            value={`${formatAmount(metrics.suppliedAmount)} (${formatUsd(metrics.suppliedUsd)})`}
          />
          <MetricRow
            label="Supply cap"
            value={
              metrics.supplyCapUsedPct === undefined
                ? "No cap"
                : `${formatAmount(metrics.supplyCapAmount)} (${formatPct(metrics.supplyCapUsedPct)} used)`
            }
          />
          {shareOfCollateralPct !== undefined && (
            <MetricRow label="Share of market collateral" value={formatPct(shareOfCollateralPct)} />
          )}
        </div>
      )}
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-0 !bg-muted-foreground" />
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-1.5">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-card-foreground">{value}</span>
    </div>
  )
}

export const DependencyNode = memo(DependencyNodeComponent)
