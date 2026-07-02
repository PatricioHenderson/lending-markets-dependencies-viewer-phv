import { GraphQLClient } from '../../graph/graphql'
import type { Chain } from '../../web3/chains'
import { isAaveSubgraphMarket, resolveAaveSubgraphUrl } from './networks'
import {
  AAVE_MARKET_QUERY,
  AAVE_MARKETS_QUERY,
  AAVE_RESERVE_ID_BY_UNDERLYING_QUERY,
} from './queries'
import type {
  Market,
  MarketQueryResponse,
  MarketReserveTokens,
  MarketsQueryResponse,
  ReserveQueryResponse,
  ResolvedReserve,
} from './types'

const AAVE_API_ENDPOINT = 'https://api.v3.aave.com/graphql'

export class AaveQuerier {
  private readonly apiClient: GraphQLClient
  private readonly subgraphClient: GraphQLClient

  constructor(private readonly chain: Chain) {
    this.apiClient = new GraphQLClient(AAVE_API_ENDPOINT)
    this.subgraphClient = new GraphQLClient(resolveAaveSubgraphUrl(chain))
  }

  async findReserve(address: string): Promise<ResolvedReserve | undefined> {
    const match = await this.findReserveToken(address)
    if (!match) return undefined

    const market = await this.getMarket(match.marketAddress)
    if (!market) return undefined

    const reserve = market.reserves.find((item) => this.matchesAddress(item.underlyingToken.address, match.underlyingAddress))
    if (!reserve) return undefined

    const reserveId = await this.reserveIdForUnderlying(reserve.underlyingToken.address)
    if (!reserveId) return undefined

    return { market, reserve, reserveId }
  }

  private async getMarketReserveTokens(): Promise<MarketReserveTokens[]> {
    const response = await this.apiClient.request<MarketsQueryResponse>(AAVE_MARKETS_QUERY, { chainId: this.chain.id })
    return response.markets
  }

  private async getMarket(marketAddress: string): Promise<Market | null> {
    const response = await this.apiClient.request<MarketQueryResponse>(AAVE_MARKET_QUERY, {
      chainId: this.chain.id,
      marketAddress,
    })

    return response.market
  }

  private async findReserveToken(address: string): Promise<{ marketAddress: string; underlyingAddress: string } | undefined> {
    const normalized = this.normalizeAddress(address)
    const markets = await this.getMarketReserveTokens()

    for (const market of markets) {
      const reserveByToken = market.reserves.find((reserve) => this.matchesAddress(reserve.underlyingToken.address, normalized))
        ?? market.reserves.find((reserve) => this.matchesAddress(reserve.aToken.address, normalized))
        ?? market.reserves.find((reserve) => this.matchesAddress(reserve.vToken.address, normalized))
        ?? market.reserves.find((reserve) => this.matchesSymbol(reserve.underlyingToken.symbol, normalized))
        ?? market.reserves.find((reserve) => this.matchesSymbol(reserve.aToken.symbol, normalized))

      if (reserveByToken) {
        if (!this.isSupportedMarket(market)) {
          throw new Error(`Reserve ${address} belongs to ${market.name}, which is listed by Aave but is not supported by the current subgraph-backed Aave report pipeline.`)
        }

        return {
          marketAddress: market.address,
          underlyingAddress: reserveByToken.underlyingToken.address,
        }
      }
    }

    return undefined
  }

  private isSupportedMarket(market: MarketReserveTokens): boolean {
    return isAaveSubgraphMarket(this.chain, market.address)
  }

  private async reserveIdForUnderlying(underlyingAddress: string): Promise<string | undefined> {
    const response = await this.subgraphClient.request<ReserveQueryResponse>(AAVE_RESERVE_ID_BY_UNDERLYING_QUERY, {
      underlyingAsset: this.normalizeAddress(underlyingAddress),
    })

    return response.reserves[0]?.id
  }

  private matchesAddress(candidate: string, expected: string): boolean {
    return this.normalizeAddress(candidate) === this.normalizeAddress(expected)
  }

  private matchesSymbol(candidate: string, expected: string): boolean {
    return this.normalizeAddress(candidate) === expected
  }

  private normalizeAddress(value: string): string {
    return value.toLowerCase()
  }
}
