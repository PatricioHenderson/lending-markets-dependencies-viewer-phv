export interface TokenAddressSymbol {
  address: string
  symbol: string
}

export interface TokenAddress {
  address: string
}

export interface SupplyInfo {
  canBeCollateral: boolean
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
