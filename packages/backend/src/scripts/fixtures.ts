import type { DependencyGraphInput } from '../graph/types'

export const AUSDC_CHAIN = 'ethereum (1)'
export const AUSDC_CHAIN_ID = 1

export const AUSDC_INPUT: DependencyGraphInput = {
  market: 'aEthUSDC',
  protocol: 'Aave V3',
  loan: 'USDC',
  chainId: AUSDC_CHAIN_ID,
  collaterals: [
    'AAVE',
    'BTC.b',
    'FBTC',
    'LBTC',
    'PT-sUSDE-5FEB2026',
    'PT-USDe-5FEB2026',
    'PYUSD',
    'USDC',
    'USDT',
    'WBTC',
    'WETH',
    'cbBTC',
    'cbETH',
    'eBTC',
    'rETH',
    'syrupUSDT',
    'tBTC',
    'weETH',
    'wstETH',
  ],
}
