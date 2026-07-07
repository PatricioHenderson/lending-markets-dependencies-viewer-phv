export function formatAmount(raw: string): string {
  return Number(raw).toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export function formatUsd(value: number): string {
  return value.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 })
}

export function formatCompactUsd(value: number): string {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  })
}

export function formatPct(value: number): string {
  if (Math.abs(value) >= 1000) return `${Math.round(value).toLocaleString()}%`
  return `${value.toFixed(1)}%`
}
