export interface TokenLike {
  symbol: string
  tags: string[]
  isListed?: boolean
}

export interface CorrelationProfile {
  collateralFamily: string
  loanFamily: string
  isLoanCorrelated: boolean
}

export function assetFamily(asset: TokenLike): string {
  const tags = new Set(asset.tags.map((tag) => tag.toLowerCase()))
  const symbol = asset.symbol.toLowerCase()

  if (tags.has('stablecoin') || symbol.includes('usd') || ['dai', 'sdai'].includes(symbol)) return 'stablecoin'
  if (tags.has('lst') || tags.has('eth') || symbol.includes('eth')) return 'ETH-correlated'
  if (tags.has('btc') || symbol.includes('btc')) return 'BTC-correlated'
  if (tags.has('rwa')) return 'RWA'

  return 'long-tail / other'
}

export function describeCollateralFamily(asset: TokenLike): string {
  const symbol = asset.symbol.toLowerCase()
  const tags = new Set(asset.tags.map((tag) => tag.toLowerCase()))

  if (tags.has('lst') || symbol.includes('wsteth') || symbol.includes('steth') || tags.has('eth')) return 'ETH/LST-correlated'
  if (tags.has('btc')) return 'BTC-correlated'
  if (tags.has('stablecoin')) return 'stablecoin'

  return 'other'
}

export function describeCollateralFlags(asset: TokenLike): string {
  const flags = []

  if (asset.isListed) flags.push('listed')
  if (asset.tags.length) flags.push(`tags=${asset.tags.join(', ')}`)
  if (!flags.length) return 'Unknown'

  return flags.join('; ')
}

export function describeCorrelation(collateralAsset: TokenLike, loanAsset: TokenLike): CorrelationProfile {
  const collateralFamily = assetFamily(collateralAsset)
  const loanFamily = assetFamily(loanAsset)

  return {
    collateralFamily,
    loanFamily,
    isLoanCorrelated: collateralFamily === loanFamily,
  }
}
