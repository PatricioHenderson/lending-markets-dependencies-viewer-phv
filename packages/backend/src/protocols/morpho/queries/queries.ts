export const MARKET_QUERY = `
  query MarketReport($marketId: String!, $chainId: Int!) {
    marketByUniqueKey: marketById(marketId: $marketId, chainId: $chainId) {
      lltv
      collateralAsset {
        symbol
        tags
        isListed
      }
      loanAsset {
        symbol
        tags
      }
      realizedBadDebt {
        usd
      }
      state {
        borrowAssetsUsd
        supplyAssetsUsd
        liquidityAssetsUsd
        utilization
        supplyApy
        borrowApy
        fee
      }
    }
  }
`

export const MARKETS_QUERY = `
  query Markets($chainId: Int!, $first: Int!, $skip: Int!) {
    markets(
      first: $first
      skip: $skip
      orderBy: SupplyAssetsUsd
      orderDirection: Desc
      where: {
        chainId_in: [$chainId]
        listed: true
        isIdle: false
        supplyAssetsUsd_gte: 1
      }
    ) {
      items {
        marketId
        collateralAsset {
          symbol
        }
        loanAsset {
          symbol
        }
      }
    }
  }
`

export const BORROWERS_QUERY = `
  query Borrowers($marketId: String!, $chainId: Int!, $first: Int!) {
    marketPositions(
      first: $first
      orderBy: BorrowShares
      orderDirection: Desc
      where: {
        marketUniqueKey_in: [$marketId]
        chainId_in: [$chainId]
        borrowShares_gte: "1"
      }
    ) {
      items {
        state {
          borrowAssetsUsd
        }
      }
    }
  }
`

export const SUPPLIERS_QUERY = `
  query Suppliers($marketId: String!, $chainId: Int!, $first: Int!) {
    marketPositions(
      first: $first
      orderBy: SupplyShares
      orderDirection: Desc
      where: {
        marketUniqueKey_in: [$marketId]
        chainId_in: [$chainId]
        supplyShares_gte: "1"
      }
    ) {
      items {
        state {
          supplyAssetsUsd
        }
      }
    }
  }
`

export const HISTORICAL_MARKET_QUERY = `
  query HistoricalMarket($marketId: String!, $chainId: Int!, $options: TimeseriesOptions) {
    marketByUniqueKey: marketById(marketId: $marketId, chainId: $chainId) {
      historicalState {
        supplyAssetsUsd(options: $options) {
          x
          y
        }
        borrowAssetsUsd(options: $options) {
          x
          y
        }
      }
    }
  }
`
