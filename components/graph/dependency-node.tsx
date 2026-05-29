"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { NODE_TYPE_META, type NodeType } from "@/lib/graph-types"
import type { FlowNodeData } from "@/lib/graph-layout"
import { cn } from "@/lib/utils"

function DependencyNodeComponent({ data, selected }: NodeProps) {
  const d = data as FlowNodeData
  const meta = NODE_TYPE_META[d.type as NodeType]
  const color = meta?.color ?? "#94a3b8"
  const isRoot = d.isRoot

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-md border bg-card/90 px-3 py-2 backdrop-blur-sm transition-shadow",
        isRoot ? "border-2" : "border",
        selected ? "ring-2 ring-offset-1 ring-offset-background" : "",
      )}
      style={{
        width: 180,
        height: 56,
        borderColor: color,
        boxShadow: isRoot ? `0 0 0 1px ${color}, 0 0 18px ${color}55` : undefined,
        // @ts-expect-error css var for ring
        "--tw-ring-color": color,
      }}
    >
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
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-0 !bg-muted-foreground" />
    </div>
  )
}

export const DependencyNode = memo(DependencyNodeComponent)
