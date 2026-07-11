import { JsonRpcProvider } from 'ethers'

const DEFAULT_ETHEREUM_RPC_URL = 'https://ethereum-rpc.publicnode.com'

const providers = new Map<number, JsonRpcProvider>()

export function resolveRpcUrl(chainId: number): string {
  if (chainId === 1) return process.env.ETHEREUM_RPC_URL || DEFAULT_ETHEREUM_RPC_URL

  throw new Error(`No RPC configured for chain id "${chainId}". Supported chain ids: 1`)
}

export function getRpcProvider(chainId: number): JsonRpcProvider {
  const cached = providers.get(chainId)
  if (cached) return cached

  const provider = new JsonRpcProvider(resolveRpcUrl(chainId))
  providers.set(chainId, provider)
  return provider
}
