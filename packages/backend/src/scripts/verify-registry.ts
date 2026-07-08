import { DependencyGraphBuilder } from '../graph/DependencyGraphBuilder'
import type { DependencyGraph, DependencyGraphInput } from '../graph/types'

const CHAIN = 'ethereum (1)'

const INPUT: DependencyGraphInput = {
  market: 'aEthUSDC',
  protocol: 'Aave V3',
  loan: 'USDC',
  collaterals: [
    'AAVE',
    'BTC.b',
    'FBTC',
    'LBTC',
    'PT-sUSDE-5FEB2026',
    'PT-USDe-5FEB2026',
    'PYUSD',
    'USDC',
    'USDT',
    'WBTC',
    'WETH',
    'cbBTC',
    'cbETH',
    'eBTC',
    'rETH',
    'syrupUSDT',
    'tBTC',
    'weETH',
    'wstETH',
  ],
}

const LLM_ENV_KEYS = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'OPENROUTER_API_KEY']

let failures = 0

function pass(message: string): void {
  console.log(`PASS: ${message}`)
}

function fail(message: string): void {
  failures++
  console.error(`FAIL: ${message}`)
}

function findNodeIdEndingWith(graph: DependencyGraph, suffix: string): string | undefined {
  return graph.nodes.find((node) => node.id.endsWith(`:${suffix}`))?.id
}

function hasEdge(graph: DependencyGraph, from: string | undefined, to: string | undefined): boolean {
  if (!from || !to) return false
  return graph.edges.some((edge) => edge.from === from && edge.to === to)
}

async function main(): Promise<void> {
  for (const key of LLM_ENV_KEYS) delete process.env[key]

  let graph: DependencyGraph
  try {
    graph = await new DependencyGraphBuilder().build(INPUT, CHAIN)
    pass('Built the graph without instantiating any LLM client (no API key configured).')
  } catch (error) {
    fail(`Building with only curated tokens threw unexpectedly: ${(error as Error).message}`)
    return report()
  }

  const graphAgain = await new DependencyGraphBuilder().build(INPUT, CHAIN)
  if (JSON.stringify(graph) === JSON.stringify(graphAgain)) {
    pass('Graph output is deterministic across two builds.')
  } else {
    fail('Graph output differs between two builds of the same input.')
  }

  const expectedEdges: Array<[string, string]> = [
    ['pt-susde-5feb2026', 'susde'],
    ['susde', 'usde'],
    ['usde', 'ethena'],
    ['lbtc', 'lombard'],
    ['btc-b', 'avalanche-bridge'],
    ['fbtc', 'function'],
    ['tbtc', 'threshold-network'],
  ]
  for (const [fromSuffix, toSuffix] of expectedEdges) {
    const from = findNodeIdEndingWith(graph, fromSuffix)
    const to = findNodeIdEndingWith(graph, toSuffix)
    if (hasEdge(graph, from, to)) {
      pass(`Critical chain edge present: ${fromSuffix} -> ${toSuffix}`)
    } else {
      fail(`Missing expected edge: ${fromSuffix} -> ${toSuffix} (from=${from ?? 'not found'}, to=${to ?? 'not found'})`)
    }
  }

  const etherFiNodes = graph.nodes.filter((node) => node.label === 'Ether.fi')
  if (etherFiNodes.length === 1) {
    pass('Exactly one Ether.fi node exists (no ether-fi/etherfi duplicates).')
  } else {
    fail(`Expected exactly one Ether.fi node, found ${etherFiNodes.length}.`)
  }

  const badProvenanceNodes = graph.nodes.filter((node) => !node.provenance || node.provenance === 'llm')
  if (badProvenanceNodes.length === 0) {
    pass('All nodes have provenance and none is "llm".')
  } else {
    fail(`Nodes with missing or "llm" provenance: ${badProvenanceNodes.map((node) => node.id).join(', ')}`)
  }

  try {
    await new DependencyGraphBuilder().build(
      { ...INPUT, collaterals: [...INPUT.collaterals, 'FAKETOKEN'] },
      CHAIN,
    )
    fail('Expected build with an unregistered token to throw (missing LLM API key), but it succeeded.')
  } catch (error) {
    const message = (error as Error).message
    if (/API_KEY/.test(message)) {
      pass('Unregistered token correctly falls back to the LLM client and throws for the missing API key.')
    } else {
      fail(`Fallback build threw an unexpected error: ${message}`)
    }
  }

  report()
}

function report(): void {
  if (failures > 0) {
    console.error(`\n${failures} check(s) failed.`)
    process.exit(1)
  }
  console.log('\nAll checks passed.')
}

main().catch((error) => {
  console.error('Unexpected error while running verification:', error)
  process.exit(1)
})
