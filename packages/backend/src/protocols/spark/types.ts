export type Market = {
  symbol: string
  underlyingAddress: string
  spTokenAddress: string
  variableDebtTokenAddress: string
}

export type ResolvedReserve = {
  reserve: Market
  reserves: Market[]
  reserveId: string
}

export type DebtCollateralization = {
  symbol: string
  amountUsd: number
}

export type MarketResponse = {
  symbol: string
  underlying_address: string
}

export type DebtCollateralizationResponse = {
  key: string
  amount: string
}
