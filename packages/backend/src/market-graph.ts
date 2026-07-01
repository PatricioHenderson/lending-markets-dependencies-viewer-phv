import { ReportDependencyGraphBuilder } from './lib/dependency-graph/ReportDependencyGraphBuilder'
import type { DependencyGraph } from './lib/dependency-graph/types'
import { DEFAULT_CHAINS, parseChainId, requireChain } from './lib/web3/chains'
import { DEFAULT_LLM_PROVIDER, normalizeLlmProvider, type LlmProvider } from './lib/llms/providers'
import type { KnownReport } from './lib/reports/protocols'
import { AaveV3ReportBuilder } from './protocols/aave/report/AaveV3ReportBuilder'
import { AAVE_CHAINS } from './protocols/aave/queries/networks'
import { MapleReportBuilder } from './protocols/maple/report/MapleReportBuilder'
import { MAPLE_CHAINS } from './protocols/maple/queries/networks'
import { MorphoReportBuilder } from './protocols/morpho/report/MorphoReportBuilder'
import { SparkReportBuilder } from './protocols/spark/report/SparkReportBuilder'
import { SPARK_CHAINS } from './protocols/spark/queries/networks'

export type MarketProtocol = 'aave-v3' | 'morpho' | 'spark' | 'maple'

export type MarketGraphRequest = {
  protocol: string
  chainId: string | number
  marketId: string
  llm?: string
}

export const SUPPORTED_PROTOCOLS: Array<{
  id: MarketProtocol
  label: string
  chains: Array<{ id: number; network: string }>
}> = [
  { id: 'aave-v3', label: 'Aave V3', chains: AAVE_CHAINS },
  { id: 'morpho', label: 'Morpho', chains: DEFAULT_CHAINS },
  { id: 'spark', label: 'SparkLend', chains: SPARK_CHAINS },
  { id: 'maple', label: 'Maple', chains: MAPLE_CHAINS },
]

export async function buildMarketGraph(input: MarketGraphRequest): Promise<DependencyGraph> {
  const protocol = normalizeProtocol(input.protocol)
  const chainId = normalizeChainId(input.chainId)
  const marketId = input.marketId.trim()
  const llmProvider = normalizeGraphLlm(input.llm)

  if (!marketId) throw new Error('marketId is required.')

  const report = await buildReport(protocol, chainId, marketId)
  return new ReportDependencyGraphBuilder(llmProvider).build(report)
}

function normalizeProtocol(value: string): MarketProtocol {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'aave' || normalized === 'aave-v3') return 'aave-v3'
  if (normalized === 'morpho') return 'morpho'
  if (normalized === 'spark' || normalized === 'sparklend') return 'spark'
  if (normalized === 'maple') return 'maple'

  throw new Error(`Unsupported protocol "${value}".`)
}

function normalizeChainId(value: string | number): number {
  return typeof value === 'number' ? parseChainId(String(value)) : parseChainId(value)
}

function normalizeGraphLlm(value: string | undefined): LlmProvider {
  return normalizeLlmProvider(value || DEFAULT_LLM_PROVIDER)
}

async function buildReport(protocol: MarketProtocol, chainId: number, marketId: string): Promise<KnownReport> {
  if (protocol === 'aave-v3') {
    const chain = requireChain(chainId, AAVE_CHAINS, 'Aave V3 chain')
    return new AaveV3ReportBuilder(chain).build(marketId)
  }

  if (protocol === 'spark') {
    const chain = requireChain(chainId, SPARK_CHAINS, 'Spark chain')
    return new SparkReportBuilder(chain).build(marketId)
  }

  if (protocol === 'maple') {
    const chain = requireChain(chainId, MAPLE_CHAINS, 'Maple chain')
    return new MapleReportBuilder(chain).build(marketId)
  }

  const chain = requireChain(chainId)
  return new MorphoReportBuilder().build(chain, marketId)
}
