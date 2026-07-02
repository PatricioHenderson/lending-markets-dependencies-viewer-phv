export interface PoolAsset {
  symbol: string
}

export interface PoolSummary {
  id: string
  name: string
  asset: PoolAsset
}

export interface SyrupPoolsResponse {
  poolV2S: PoolSummary[]
}

export interface MaplePool {
  symbol: string
  name: string
  assetSymbol: string
}
