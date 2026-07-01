import { JsonRpcProvider } from 'ethers'
import type { Chain } from './chains'

export interface Web3Connection {
  provider: JsonRpcProvider
  rpcUrl: string
}

export interface Web3ProviderOptions {
  rpcUrlsByChain?: Record<number, string[]>
}

export const DEFAULT_RPC_URLS_BY_CHAIN: Record<number, string[]> = {
  1: ['https://ethereum.publicnode.com', 'https://cloudflare-eth.com', 'https://eth.llamarpc.com'],
  10: ['https://mainnet.optimism.io'],
  130: ['https://mainnet.unichain.org'],
  137: ['https://polygon.drpc.org'],
  42161: ['https://arb1.arbitrum.io/rpc'],
  8453: ['https://mainnet.base.org'],
}

export class Web3Provider<TChain extends Chain = Chain> {
  private readonly rpcUrlsByChain: Record<number, string[]>
  private readonly cursors = new Map<number, number>()

  constructor(options: Web3ProviderOptions = {}) {
    this.rpcUrlsByChain = options.rpcUrlsByChain || DEFAULT_RPC_URLS_BY_CHAIN
  }

  async connect(chain: TChain): Promise<Web3Connection> {
    const candidates = this.candidates(chain)

    for (const rpcUrl of candidates) {
      try {
        const provider = new JsonRpcProvider(rpcUrl)
        await provider.getNetwork()

        return { provider, rpcUrl }
      } catch {
        continue
      }
    }

    throw new Error(`No working RPC URL found for ${chain.network}. Tried: ${candidates.join(', ')}`)
  }

  private candidates(chain: TChain): string[] {
    const urls = this.rpcUrlsByChain[chain.id] || []
    if (urls.length === 0) return []

    const cursor = this.cursors.get(chain.id) || 0
    const start = cursor % urls.length
    this.cursors.set(chain.id, (cursor + 1) % urls.length)
    return [...urls.slice(start), ...urls.slice(0, start)]
  }
}
