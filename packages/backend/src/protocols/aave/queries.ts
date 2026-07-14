export const AAVE_MARKETS_QUERY = `
  query($chainId: ChainId!) {
    markets(request: { chainIds: [$chainId] }) {
      name
      address
      reserves(request: { reserveType: BOTH }) {
        underlyingToken {
          address
          symbol
        }
        aToken {
          address
          symbol
        }
        vToken {
          address
        }
        supplyInfo {
          canBeCollateral
        }
      }
    }
  }
`

export const AAVE_MARKET_QUERY = `
  query($chainId: ChainId!, $marketAddress: EvmAddress!) {
    market(request: { chainId: $chainId, address: $marketAddress }) {
      reserves {
        underlyingToken {
          address
          symbol
        }
        aToken {
          address
          symbol
        }
        supplyInfo {
          canBeCollateral
          total {
            value
          }
          supplyCap {
            amount {
              value
            }
            usd
          }
          maxLTV {
            formatted
          }
          liquidationThreshold {
            formatted
          }
          liquidationBonus {
            formatted
          }
        }
        size {
          usd
        }
        isFrozen
        isPaused
      }
    }
  }
`

export const AAVE_RESERVE_ID_BY_UNDERLYING_QUERY = `
  query($underlyingAsset: Bytes!) {
    reserves(where: { underlyingAsset: $underlyingAsset }, first: 1) {
      id
    }
  }
`
