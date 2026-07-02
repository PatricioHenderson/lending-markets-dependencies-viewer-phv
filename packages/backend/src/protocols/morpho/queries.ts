export const MORPHO_MARKET_QUERY = `
  query MarketReport($marketId: String!, $chainId: Int!) {
    marketByUniqueKey: marketById(marketId: $marketId, chainId: $chainId) {
      collateralAsset {
        symbol
      }
      loanAsset {
        symbol
      }
    }
  }
`
