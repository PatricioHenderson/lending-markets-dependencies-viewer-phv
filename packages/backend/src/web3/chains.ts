export interface Chain {
  id: number
  network: string
  currency?: string
}

export const DEFAULT_CHAINS: Chain[] = [
  { id: 1, network: 'Ethereum' },
  { id: 8453, network: 'Base' },
  { id: 42161, network: 'Arbitrum One' },
  { id: 137, network: 'Polygon' },
  { id: 130, network: 'Unichain' },
  { id: 10, network: 'OP Mainnet' },
]

export function parseChainId(value: string): number {
  const chainId = Number(value)

  if (Number.isInteger(chainId) && chainId > 0) return chainId

  throw new Error(`Invalid chain id "${value}".`)
}

export function requireChain(chainId: number, chains: Chain[] = DEFAULT_CHAINS, label = 'chain'): Chain {
  const chain = chains.find((item) => item.id === chainId)

  if (!chain) {
    const supported = chains.map((item) => item.id).join(', ')
    throw new Error(`Unsupported ${label} id "${chainId}". Supported chain ids: ${supported}`)
  }

  return chain
}
