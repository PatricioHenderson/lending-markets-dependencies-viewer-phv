import { DEFAULT_CHAINS, parseChainId, requireChain } from '../web3/chains'
import { DEFAULT_LLM_PROVIDER, normalizeLlmProvider, type LlmProvider } from '../llms/providers'
import { DependencyGraphBuilder } from './DependencyGraphBuilder'
import type {
  CollateralSupplyMetrics,
  DependencyGraph,
  DependencyGraphInput,
  MarketGraphRequest,
  MarketProtocol,
  MarketSupplyMetrics,
  SupportedProtocol,
} from './types'
import { AaveQuerier } from '../protocols/aave/AaveQuerier'
import type { Reserve as AaveReserve } from '../protocols/aave/types'
import { MAPLE_CHAINS } from '../protocols/maple/networks'
import { MapleQuerier } from '../protocols/maple/MapleQuerier'
import { SPARK_CHAINS } from '../protocols/spark/networks'
import { SparkQuerier } from '../protocols/spark/SparkQuerier'
import { AAVE_CHAINS } from '../protocols/aave/networks'
import { MorphoQuerier } from '../protocols/morpho/MorphoQuerier'

export const SUPPORTED_PROTOCOLS: SupportedProtocol[] = [
  { id: 'aave-v3', label: 'Aave V3', chains: AAVE_CHAINS },
  { id: 'morpho', label: 'Morpho', chains: DEFAULT_CHAINS },
  { id: 'spark', label: 'SparkLend', chains: SPARK_CHAINS },
  { id: 'maple', label: 'Maple', chains: MAPLE_CHAINS },
]

export class LendingMarketGraphBuilder {
  async build(input: MarketGraphRequest): Promise<DependencyGraph> {
    const protocol = this.normalizeProtocol(input.protocol)
    const chainId = this.normalizeChainId(input.chainId)
    const marketId = input.marketId.trim()
    const llmProvider = this.normalizeGraphLlm(input.llm)

    if (!marketId) throw new Error('marketId is required.')

    const graphInput = await this.buildGraphInput(protocol, chainId, marketId)
    return new DependencyGraphBuilder(llmProvider).build(graphInput, graphInput.chain)
  }

  private normalizeProtocol(value: string): MarketProtocol {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'aave' || normalized === 'aave-v3') return 'aave-v3'
    if (normalized === 'morpho') return 'morpho'
    if (normalized === 'spark' || normalized === 'sparklend') return 'spark'
    if (normalized === 'maple') return 'maple'

    throw new Error(`Unsupported protocol "${value}".`)
  }

  private normalizeChainId(value: string | number): number {
    return typeof value === 'number' ? parseChainId(String(value)) : parseChainId(value)
  }

  private normalizeGraphLlm(value: string | undefined): LlmProvider {
    return normalizeLlmProvider(value || DEFAULT_LLM_PROVIDER)
  }

  private async buildGraphInput(protocol: MarketProtocol, chainId: number, marketId: string): Promise<DependencyGraphInput & { chain: string }> {
    if (protocol === 'aave-v3') {
      const chain = requireChain(chainId, AAVE_CHAINS, 'Aave V3 chain')
      const resolved = await new AaveQuerier(chain).findReserve(marketId)
      if (!resolved) throw new Error(`Reserve ${marketId} was not found.`)

      const collateralReserves = resolved.market.reserves
        .filter((reserve) => reserve.supplyInfo.canBeCollateral)
        .sort((a, b) => Number(b.size.usd) - Number(a.size.usd))

      return {
        chain: `${chain.network} (${chain.id})`,
        chainId: chain.id,
        market: this.prefix(resolved.reserve.aToken.symbol, 'a'),
        marketAddress: resolved.reserve.aToken.address,
        protocol: 'Aave V3',
        loan: resolved.reserve.underlyingToken.symbol,
        loanAddress: resolved.reserve.underlyingToken.address,
        collaterals: collateralReserves.map((reserve) => reserve.underlyingToken.symbol || reserve.aToken.symbol),
        collateralAddresses: this.buildCollateralAddresses(collateralReserves),
        collateralMetrics: this.buildCollateralMetrics(collateralReserves),
        marketSupply: this.reserveSupplyBase(resolved.reserve),
      }
    }

    if (protocol === 'spark') {
      const chain = requireChain(chainId, SPARK_CHAINS, 'Spark chain')
      const querier = new SparkQuerier(chain)
      const resolved = await querier.findReserve(marketId)
      if (!resolved) throw new Error(`Reserve ${marketId} was not found.`)
      const debtCollateralization = await querier.getDebtCollateralization(resolved.reserveId)

      return {
        chain: `${chain.network} (${chain.id})`,
        chainId: chain.id,
        market: resolved.reserve.symbol,
        protocol: 'SparkLend',
        loan: resolved.reserve.symbol,
        collaterals: debtCollateralization
          .filter((collateral) => collateral.amountUsd > 0)
          .map((collateral) => collateral.symbol),
      }
    }

    if (protocol === 'maple') {
      const chain = requireChain(chainId, MAPLE_CHAINS, 'Maple chain')
      const pool = await new MapleQuerier(chain).findPool(marketId)
      if (!pool) throw new Error(`Maple pool ${marketId} was not found.`)

      return {
        chain: `${chain.network} (${chain.id})`,
        chainId: chain.id,
        market: pool.symbol || pool.name,
        protocol: 'Maple',
        loan: pool.assetSymbol,
        collaterals: [],
      }
    }

    const chain = requireChain(chainId)
    const market = await new MorphoQuerier().getMarket(chain, marketId)

    return {
      chain: `${chain.network} (${chain.id})`,
      chainId: chain.id,
      market: `${market.collateralAsset.symbol}/${market.loanAsset.symbol}`,
      protocol: 'Morpho',
      loan: market.loanAsset.symbol,
      collaterals: [market.collateralAsset.symbol],
    }
  }

  private prefix(symbol: string, value: string): string {
    return symbol.startsWith(value) ? symbol : `${value}${symbol}`
  }

  private buildCollateralAddresses(reserves: AaveReserve[]): Record<string, string> {
    const addresses: Record<string, string> = {}
    for (const reserve of reserves) {
      const symbol = reserve.underlyingToken.symbol || reserve.aToken.symbol
      addresses[symbol] = reserve.underlyingToken.address
    }

    return addresses
  }

  private buildCollateralMetrics(reserves: AaveReserve[]): Record<string, CollateralSupplyMetrics> {
    const totalCollateralUsd = reserves.reduce((sum, reserve) => sum + Number(reserve.size.usd), 0)

    const metrics: Record<string, CollateralSupplyMetrics> = {}
    for (const reserve of reserves) {
      const symbol = reserve.underlyingToken.symbol || reserve.aToken.symbol
      const suppliedUsd = Number(reserve.size.usd)

      metrics[symbol] = {
        ...this.reserveSupplyBase(reserve),
        shareOfCollateralPct: totalCollateralUsd > 0 ? (suppliedUsd / totalCollateralUsd) * 100 : 0,
        maxLtvPct: Number(reserve.supplyInfo.maxLTV.formatted),
        liquidationThresholdPct: Number(reserve.supplyInfo.liquidationThreshold.formatted),
        liquidationBonusPct: Number(reserve.supplyInfo.liquidationBonus.formatted),
        isFrozen: reserve.isFrozen,
        isPaused: reserve.isPaused,
      }
    }

    return metrics
  }

  private reserveSupplyBase(reserve: AaveReserve): MarketSupplyMetrics {
    const suppliedAmount = Number(reserve.supplyInfo.total.value)
    const supplyCapAmount = Number(reserve.supplyInfo.supplyCap.amount.value)

    return {
      suppliedAmount: reserve.supplyInfo.total.value,
      supplyCapAmount: reserve.supplyInfo.supplyCap.amount.value,
      supplyCapUsedPct: supplyCapAmount > 0 ? (suppliedAmount / supplyCapAmount) * 100 : undefined,
      suppliedUsd: Number(reserve.size.usd),
    }
  }
}
