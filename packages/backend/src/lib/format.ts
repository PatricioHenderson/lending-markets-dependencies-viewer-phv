import { numeric, type BigNumber } from './numbers'

export function formatUsd(value: BigNumber): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: Math.abs(numeric(value)) >= 1_000 ? 0 : 2,
  }).format(numeric(value))
}

export function formatPercent(value: BigNumber): string {
  return `${(numeric(value) * 100).toFixed(2)}%`
}

export function stringifyJson(value: unknown, space = 2): string {
  return JSON.stringify(value, (_key, entry) => (typeof entry === 'bigint' ? entry.toString() : entry), space)
}
