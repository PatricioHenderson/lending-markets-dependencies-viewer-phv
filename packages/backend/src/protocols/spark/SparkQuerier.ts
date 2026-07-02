import type { Chain } from '../../web3/chains'
import { SPARK_RESERVE_TOKEN_ADDRESSES } from './addresses'
import {
  SPARK_DEBT_COLLATERALIZATION_PATH_PREFIX,
  SPARK_DEBT_COLLATERALIZATION_PATH_SUFFIX,
  SPARK_MARKETS_PATH,
} from './queries'
import { resolveSparkApiBaseUrl } from './networks'
import type {
  DebtCollateralization,
  DebtCollateralizationResponse,
  Market,
  MarketResponse,
  ResolvedReserve,
} from './types'

const EMPTY_TOKEN_ADDRESSES = { spTokenAddress: '', variableDebtTokenAddress: '' }

export class SparkQuerier {
  private readonly baseUrl: string

  constructor(chain: Chain) {
    this.baseUrl = resolveSparkApiBaseUrl(chain)
  }

  async findReserve(address: string): Promise<ResolvedReserve | undefined> {
    const reserves = await this.getReserves()
    const reserve = reserves.find((item) => (
      this.matchesAddress(item.underlyingAddress, address)
      || this.matchesAddress(item.spTokenAddress, address)
      || this.matchesAddress(item.variableDebtTokenAddress, address)
      || item.symbol.toLowerCase() === address.toLowerCase()
    ))
    if (!reserve) return undefined

    return { reserve, reserves, reserveId: reserve.symbol }
  }

  async getDebtCollateralization(reserveId: string): Promise<DebtCollateralization[]> {
    const response = await this.request<DebtCollateralizationResponse[]>(
      `${SPARK_DEBT_COLLATERALIZATION_PATH_PREFIX}${reserveId}${SPARK_DEBT_COLLATERALIZATION_PATH_SUFFIX}`,
    )

    return response.map((record) => ({
      symbol: record.key,
      amountUsd: Number(record.amount),
    }))
  }

  private async getReserves(): Promise<Market[]> {
    const markets = await this.request<MarketResponse[]>(SPARK_MARKETS_PATH)

    return markets.map((market) => this.buildReserve(market))
  }

  private buildReserve(market: MarketResponse): Market {
    const tokenAddresses = SPARK_RESERVE_TOKEN_ADDRESSES[market.symbol.toUpperCase()] ?? EMPTY_TOKEN_ADDRESSES

    return {
      symbol: market.symbol,
      underlyingAddress: market.underlying_address,
      spTokenAddress: tokenAddresses.spTokenAddress,
      variableDebtTokenAddress: tokenAddresses.variableDebtTokenAddress,
    }
  }

  private matchesAddress(candidate: string, expected: string): boolean {
    return Boolean(candidate) && this.normalizeAddress(candidate) === this.normalizeAddress(expected)
  }

  private normalizeAddress(value: string): string {
    return value.toLowerCase()
  }

  private async request<T>(path: string): Promise<T> {
    const url = new URL(`${this.baseUrl}/${path.replace(/^\/+/, '')}`)
    const response = await fetch(url)
    const body = await response.json().catch(() => null) as T | null

    if (!response.ok) throw new Error(`Spark API returned HTTP ${response.status} for ${url.pathname}`)
    if (!body) throw new Error(`Spark API returned an invalid JSON response for ${url.pathname}`)

    return body
  }
}
