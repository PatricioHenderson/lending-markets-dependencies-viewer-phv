export type Asset = {
  symbol: string
}

export type Market = {
  collateralAsset: Asset
  loanAsset: Asset
}

export type MarketQueryResponse = {
  marketByUniqueKey: Market | null
}
