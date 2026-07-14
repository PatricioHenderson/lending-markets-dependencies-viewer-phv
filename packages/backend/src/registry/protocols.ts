import type { ProtocolEntry } from './types'

export const PROTOCOL_REGISTRY: ProtocolEntry[] = [
  { id: 'aave-v3', label: 'Aave V3', aliases: ['aavev3', 'aave'] },
  { id: 'lido', label: 'Lido', aliases: [] },
  { id: 'ether-fi', label: 'Ether.fi', aliases: ['etherfi'] },
  { id: 'coinbase', label: 'Coinbase', aliases: [] },
  { id: 'rocket-pool', label: 'Rocket Pool', aliases: ['rocketpool'] },
  { id: 'bitgo', label: 'BitGo', aliases: [] },
  { id: 'wbtc-dao', label: 'WBTC DAO', aliases: ['wbtcdao'] },
  { id: 'threshold-network', label: 'Threshold Network', aliases: ['thresholdnetwork', 'keepnetwork', 'keep'] },
  { id: 'lombard', label: 'Lombard', aliases: [] },
  { id: 'function', label: 'Function', aliases: ['fbtc', 'ignition'] },
  { id: 'avalanche-bridge', label: 'Avalanche Bridge', aliases: ['avalanchebridge', 'corebridge'] },
  { id: 'ethena', label: 'Ethena', aliases: [] },
  { id: 'pendle', label: 'Pendle', aliases: [] },
  { id: 'maple', label: 'Maple', aliases: [] },
  { id: 'morpho', label: 'Morpho', aliases: [] },
  { id: 'sparklend', label: 'SparkLend', aliases: ['spark'] },
]

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
}

export function canonicalizeProtocolLabel(label: string): string {
  const normalized = normalize(label)

  for (const entry of PROTOCOL_REGISTRY) {
    if (normalize(entry.id) === normalized) return entry.label
    if (normalize(entry.label) === normalized) return entry.label
    if (entry.aliases.some((alias) => normalize(alias) === normalized)) return entry.label
  }

  return label
}
