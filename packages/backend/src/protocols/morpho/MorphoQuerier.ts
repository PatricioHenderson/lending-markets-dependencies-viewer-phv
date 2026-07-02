import { GraphQLClient } from '../../graph/graphql'
import type { Chain } from '../../web3/chains'
import { MORPHO_MARKET_QUERY } from './queries'
import type { Market, MarketQueryResponse } from './types'

const DEFAULT_API_URL = 'https://blue-api.morpho.org/graphql'

export class MorphoQuerier {
  private readonly graphQLClient: GraphQLClient

  constructor() {
    this.graphQLClient = new GraphQLClient(DEFAULT_API_URL)
  }

  async getMarket(chain: Chain, marketId: string): Promise<Market> {
    const response = await this.graphQLClient.request<MarketQueryResponse>(MORPHO_MARKET_QUERY, {
      chainId: chain.id,
      marketId,
    })
    if (!response.marketByUniqueKey) throw new Error(`Market ${marketId} was not found on chain ${chain.id}`)

    return response.marketByUniqueKey
  }
}
