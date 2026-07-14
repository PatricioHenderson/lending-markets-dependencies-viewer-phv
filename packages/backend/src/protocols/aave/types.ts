export interface TokenAddressSymbol {
  address: string
  symbol: string
}

export interface TokenAddress {
  address: string
}

export interface DecimalValue {
  value: string
}

export interface TokenAmount {
  amount: DecimalValue
  usd: string
}

export interface PercentValue {
  formatted: string
}

export interface SupplyInfo {
  canBeCollateral: boolean
  total: DecimalValue
  supplyCap: TokenAmount
  maxLTV: PercentValue
  liquidationThreshold: PercentValue
  liquidationBonus: PercentValue
}

export interface ReserveSize {
  usd: string
}

export interface ReserveTokenAddresses {
  underlyingToken: TokenAddressSymbol
  aToken: TokenAddressSymbol
  vToken: TokenAddress
}

export interface Reserve {
  underlyingToken: TokenAddressSymbol
  aToken: TokenAddressSymbol
  supplyInfo: SupplyInfo
  size: ReserveSize
  isFrozen: boolean
  isPaused: boolean
}

export interface Market {
  name: string
  address: string
  reserves: Reserve[]
}

export interface MarketReserveTokens {
  name: string
  address: string
  reserves: ReserveTokenAddresses[]
}

export interface MarketsQueryResponse {
  markets: MarketReserveTokens[]
}

export interface MarketQueryResponse {
  market: Market | null
}

export interface ReserveId {
  id: string
}

export interface ReserveQueryResponse {
  reserves: ReserveId[]
}

export interface ResolvedReserve {
  market: Market
  reserve: Reserve
  reserveId: string
}
