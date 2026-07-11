import { Interface, JsonRpcProvider } from 'ethers'
import { DependencyGraphBuilder } from '../graph/DependencyGraphBuilder'
import type { DependencyGraph } from '../graph/types'
import { AUSDC_CHAIN, AUSDC_INPUT } from './fixtures'

const RPC_URL = 'https://ethereum-rpc.publicnode.com'
const SYMBOL_INTERFACE = new Interface(['function symbol() view returns (string)'])

const CURATED_ADDRESSES: Array<{ label: string; address: string; expectedSymbol: string }> = [
  { label: 'stETH', address: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84', expectedSymbol: 'stETH' },
  { label: 'eETH', address: '0x35fa164735182de50811e8e2e824cfb9b6118ac2', expectedSymbol: 'eETH' },
  { label: 'USDe', address: '0x4c9edd5852cd905f086c759e8383e09bff1e68b3', expectedSymbol: 'USDe' },
]

const SIMULATED_MARKET_ADDRESS = '0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c'
const SIMULATED_LOAN_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const SIMULATED_COLLATERAL_ADDRESSES: Record<string, string> = {
  WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  WBTC: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  AAVE: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
}

let failures = 0
let skips = 0

function pass(message: string): void {
  console.log(`PASS: ${message}`)
}

function fail(message: string): void {
  failures++
  console.error(`FAIL: ${message}`)
}

function skip(message: string): void {
  skips++
  console.warn(`SKIP: ${message}`)
}

function findNodeByLabel(graph: DependencyGraph, label: string): DependencyGraph['nodes'][number] | undefined {
  return graph.nodes.find((node) => node.label === label)
}

async function verifyAddressPropagation(): Promise<void> {
  const input = {
    ...AUSDC_INPUT,
    marketAddress: SIMULATED_MARKET_ADDRESS,
    loanAddress: SIMULATED_LOAN_ADDRESS,
    collateralAddresses: SIMULATED_COLLATERAL_ADDRESSES,
  }

  const graph = await new DependencyGraphBuilder().build(input, AUSDC_CHAIN)

  const root = graph.nodes.find((node) => node.id === graph.root)
  if (root?.address?.toLowerCase() === SIMULATED_MARKET_ADDRESS.toLowerCase()) {
    pass('Root node carries the simulated marketAddress.')
  } else {
    fail(`Root node address mismatch: expected ${SIMULATED_MARKET_ADDRESS}, got ${root?.address}`)
  }

  const loanNode = findNodeByLabel(graph, 'USDC')
  if (loanNode?.address?.toLowerCase() === SIMULATED_LOAN_ADDRESS.toLowerCase()) {
    pass('Loan node carries the simulated loanAddress.')
  } else {
    fail(`Loan node address mismatch: expected ${SIMULATED_LOAN_ADDRESS}, got ${loanNode?.address}`)
  }

  for (const [symbol, expectedAddress] of Object.entries(SIMULATED_COLLATERAL_ADDRESSES)) {
    const node = findNodeByLabel(graph, symbol)
    if (node?.address?.toLowerCase() === expectedAddress.toLowerCase()) {
      pass(`Collateral node "${symbol}" carries its simulated address.`)
    } else {
      fail(`Collateral node "${symbol}" address mismatch: expected ${expectedAddress}, got ${node?.address}`)
    }
  }

  const stEthNode = findNodeByLabel(graph, 'stETH')
  if (stEthNode?.address?.toLowerCase() === CURATED_ADDRESSES[0].address.toLowerCase()) {
    pass('Intermediate curated node "stETH" carries its registry address (no simulated input needed).')
  } else {
    fail(`Intermediate curated node "stETH" address mismatch: expected ${CURATED_ADDRESSES[0].address}, got ${stEthNode?.address}`)
  }

  const ethNode = findNodeByLabel(graph, 'ETH')
  if (!ethNode?.address) {
    pass('ETH node has no address, as expected (native asset).')
  } else {
    fail(`ETH node unexpectedly has an address: ${ethNode.address}`)
  }
}

async function verifyCuratedAddressesOnChain(): Promise<void> {
  const provider = new JsonRpcProvider(RPC_URL)

  try {
    await withTimeout(provider.getBlockNumber(), 8000, 'RPC connectivity check')
  } catch (error) {
    skip(`RPC connectivity check failed, cannot validate curated addresses on-chain: ${(error as Error).message}`)
    provider.destroy()
    return
  }

  for (const entry of CURATED_ADDRESSES) {
    try {
      const data = SYMBOL_INTERFACE.encodeFunctionData('symbol', [])
      const result = await withTimeout(provider.call({ to: entry.address, data }), 8000, 'symbol() call')
      const [symbol] = SYMBOL_INTERFACE.decodeFunctionResult('symbol', result)
      if (symbol === entry.expectedSymbol) {
        pass(`On-chain symbol() for ${entry.label} (${entry.address}) matches: "${symbol}".`)
      } else {
        fail(`On-chain symbol() for ${entry.label} (${entry.address}) returned "${symbol}", expected "${entry.expectedSymbol}".`)
      }
    } catch (error) {
      skip(`Could not call symbol() on ${entry.label} (${entry.address}): ${(error as Error).message}`)
    }
  }

  provider.destroy()
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)),
  ])
}

async function main(): Promise<void> {
  await verifyAddressPropagation()
  await verifyCuratedAddressesOnChain()

  if (failures > 0) {
    console.error(`\n${failures} check(s) failed, ${skips} skipped.`)
    process.exit(1)
  }
  console.log(`\nAll checks passed (${skips} skipped).`)
}

main().catch((error) => {
  console.error('Unexpected error while running verification:', error)
  process.exit(1)
})
