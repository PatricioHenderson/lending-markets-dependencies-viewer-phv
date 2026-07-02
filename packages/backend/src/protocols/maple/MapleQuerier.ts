import { isAddress } from 'ethers'
import { GraphQLClient } from '../../graph/graphql'
import type { Chain } from '../../web3/chains'
import { MAPLE_POOLS_QUERY } from './queries'
import { resolveMapleApiUrl } from './networks'
import type { MaplePool, PoolSummary, SyrupPoolsResponse } from './types'

export class MapleQuerier {
  private readonly graphQLClient: GraphQLClient

  constructor(chain: Chain) {
    this.graphQLClient = new GraphQLClient(resolveMapleApiUrl(chain))
  }

  async findPool(address: string): Promise<MaplePool | undefined> {
    if (!isAddress(address)) throw new Error(`Invalid Maple pool address "${address}".`)
    const summary = await this.findPoolSummary(address)
    if (!summary) return undefined

    return {
      symbol: summary.name,
      name: summary.name,
      assetSymbol: summary.asset.symbol,
    }
  }

  private async findPoolSummary(address: string): Promise<PoolSummary | undefined> {
    const summaries = await this.getPoolSummaries()
    return summaries.find((pool) => this.normalizeAddress(pool.id) === this.normalizeAddress(address))
  }

  private async getPoolSummaries(): Promise<PoolSummary[]> {
    const response = await this.graphQLClient.request<SyrupPoolsResponse>(MAPLE_POOLS_QUERY)
    return response.poolV2S
  }

  private normalizeAddress(value: string): string {
    return value.toLowerCase()
  }
}
