import { DEFAULT_CHAINS, type Chain } from '../../../lib/web3/chains'

export const AAVE_SUBGRAPH_ID_BY_CHAIN: Record<number, string> = {
  1: 'Cd2gEDVeqnjBn1hSeqFMitw8Q1iiyV9FYUZkLNRcL87g',
  10: '3RWFxWNstn4nP3dXiDfKi9GgBoHx7xzc7APkXs1MLEgi',
  137: '6yuf1C49aWEscgk5n9D1DekeG1BCk5Z9imJYJT3sVmAT',
  42161: '4xyasjQeREe7PxnF6wVdobZvCw5mhoHZq3T7guRpuNPf',
  8453: 'GQFbb95cE6d8mV989mL5figjaGaKCQB3xqYrr1bRyXqF',
}

export const AAVE_SUBGRAPH_MARKET_ADDRESS_BY_CHAIN: Record<number, string> = {
  1: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
  10: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  137: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  42161: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  8453: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
}

export const AAVE_CHAINS: Chain[] = DEFAULT_CHAINS.filter((chain) => Boolean(AAVE_SUBGRAPH_ID_BY_CHAIN[chain.id]))

export function isAaveSubgraphMarket(chain: Chain, marketAddress: string): boolean {
  return marketAddress.toLowerCase() === AAVE_SUBGRAPH_MARKET_ADDRESS_BY_CHAIN[chain.id]?.toLowerCase()
}

export function resolveAaveSubgraphUrl(chain: Chain): string {
  const apiKey = process.env.THE_GRAPH_API_KEY?.trim()
  if (!apiKey) throw new Error('THE_GRAPH_API_KEY is required for Aave subgraph mode.')

  const subgraphId = AAVE_SUBGRAPH_ID_BY_CHAIN[chain.id]

  if (!subgraphId) {
    const supported = Object.keys(AAVE_SUBGRAPH_ID_BY_CHAIN).map((value) => Number(value)).join(', ')
    throw new Error(`Unsupported chain id "${chain.id}" for Aave V3. Supported chain ids: ${supported}`)
  }

  return `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/${subgraphId}`
}
