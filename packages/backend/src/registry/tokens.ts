import {
  DEPENDENCY_NODE_TYPE_MARKET,
  DEPENDENCY_NODE_TYPE_POSITION,
  DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN,
  DEPENDENCY_NODE_TYPE_PROTOCOL,
  DEPENDENCY_NODE_TYPE_WRAPPER,
} from '../graph/types'
import type { TokenRegistryEntry } from './types'

export const TOKEN_REGISTRY: Record<string, TokenRegistryEntry> = {
  usdc: { type: DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN, dependencies: [] },
  usdt: { type: DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN, dependencies: [] },
  pyusd: { type: DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN, dependencies: [] },
  aave: { type: DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN, dependencies: [] },
  eth: { type: DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN, dependencies: [] },
  btc: { type: DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN, dependencies: [] },

  weth: {
    type: DEPENDENCY_NODE_TYPE_WRAPPER,
    dependencies: [{ label: 'ETH', kind: DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN }],
  },
  wsteth: {
    type: DEPENDENCY_NODE_TYPE_WRAPPER,
    dependencies: [
      { label: 'stETH', kind: DEPENDENCY_NODE_TYPE_WRAPPER },
      { label: 'Lido', kind: DEPENDENCY_NODE_TYPE_PROTOCOL },
    ],
  },
  steth: {
    type: DEPENDENCY_NODE_TYPE_WRAPPER,
    dependencies: [
      { label: 'ETH', kind: DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN },
      { label: 'Lido', kind: DEPENDENCY_NODE_TYPE_PROTOCOL },
    ],
    addresses: { 1: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84' },
  },
  weeth: {
    type: DEPENDENCY_NODE_TYPE_WRAPPER,
    dependencies: [
      { label: 'eETH', kind: DEPENDENCY_NODE_TYPE_WRAPPER },
      { label: 'Ether.fi', kind: DEPENDENCY_NODE_TYPE_PROTOCOL },
    ],
  },
  eeth: {
    type: DEPENDENCY_NODE_TYPE_WRAPPER,
    dependencies: [
      { label: 'ETH', kind: DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN },
      { label: 'Ether.fi', kind: DEPENDENCY_NODE_TYPE_PROTOCOL },
    ],
    addresses: { 1: '0x35fa164735182de50811e8e2e824cfb9b6118ac2' },
  },
  ebtc: {
    type: DEPENDENCY_NODE_TYPE_WRAPPER,
    dependencies: [
      { label: 'BTC', kind: DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN },
      { label: 'Ether.fi', kind: DEPENDENCY_NODE_TYPE_PROTOCOL },
    ],
  },
  cbeth: {
    type: DEPENDENCY_NODE_TYPE_WRAPPER,
    dependencies: [
      { label: 'ETH', kind: DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN },
      { label: 'Coinbase', kind: DEPENDENCY_NODE_TYPE_PROTOCOL },
    ],
  },
  cbbtc: {
    type: DEPENDENCY_NODE_TYPE_WRAPPER,
    dependencies: [
      { label: 'BTC', kind: DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN },
      { label: 'Coinbase', kind: DEPENDENCY_NODE_TYPE_PROTOCOL },
    ],
  },
  reth: {
    type: DEPENDENCY_NODE_TYPE_WRAPPER,
    dependencies: [
      { label: 'ETH', kind: DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN },
      { label: 'Rocket Pool', kind: DEPENDENCY_NODE_TYPE_PROTOCOL },
    ],
  },
  wbtc: {
    type: DEPENDENCY_NODE_TYPE_WRAPPER,
    dependencies: [
      { label: 'BTC', kind: DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN },
      { label: 'BitGo', kind: DEPENDENCY_NODE_TYPE_PROTOCOL },
      { label: 'WBTC DAO', kind: DEPENDENCY_NODE_TYPE_PROTOCOL },
    ],
  },
  tbtc: {
    type: DEPENDENCY_NODE_TYPE_WRAPPER,
    dependencies: [
      { label: 'BTC', kind: DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN },
      { label: 'Threshold Network', kind: DEPENDENCY_NODE_TYPE_PROTOCOL },
    ],
  },
  lbtc: {
    type: DEPENDENCY_NODE_TYPE_WRAPPER,
    dependencies: [
      { label: 'BTC', kind: DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN },
      { label: 'Lombard', kind: DEPENDENCY_NODE_TYPE_PROTOCOL },
    ],
  },
  fbtc: {
    type: DEPENDENCY_NODE_TYPE_WRAPPER,
    dependencies: [
      { label: 'BTC', kind: DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN },
      { label: 'Function', kind: DEPENDENCY_NODE_TYPE_PROTOCOL },
    ],
  },
  'btc.b': {
    type: DEPENDENCY_NODE_TYPE_WRAPPER,
    dependencies: [
      { label: 'BTC', kind: DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN },
      { label: 'Avalanche Bridge', kind: DEPENDENCY_NODE_TYPE_PROTOCOL },
    ],
  },
  susde: {
    type: DEPENDENCY_NODE_TYPE_WRAPPER,
    dependencies: [
      { label: 'USDe', kind: DEPENDENCY_NODE_TYPE_WRAPPER },
      { label: 'Ethena', kind: DEPENDENCY_NODE_TYPE_PROTOCOL },
    ],
  },
  usde: {
    type: DEPENDENCY_NODE_TYPE_WRAPPER,
    dependencies: [{ label: 'Ethena', kind: DEPENDENCY_NODE_TYPE_PROTOCOL }],
    addresses: { 1: '0x4c9edd5852cd905f086c759e8383e09bff1e68b3' },
  },

  'pt-susde-5feb2026': {
    type: DEPENDENCY_NODE_TYPE_POSITION,
    dependencies: [
      { label: 'sUSDe', kind: DEPENDENCY_NODE_TYPE_WRAPPER },
      { label: 'Pendle', kind: DEPENDENCY_NODE_TYPE_PROTOCOL },
    ],
  },
  'pt-usde-5feb2026': {
    type: DEPENDENCY_NODE_TYPE_POSITION,
    dependencies: [
      { label: 'USDe', kind: DEPENDENCY_NODE_TYPE_WRAPPER },
      { label: 'Pendle', kind: DEPENDENCY_NODE_TYPE_PROTOCOL },
    ],
  },

  syrupusdt: {
    type: DEPENDENCY_NODE_TYPE_MARKET,
    dependencies: [
      { label: 'USDT', kind: DEPENDENCY_NODE_TYPE_PRIMITIVE_TOKEN },
      { label: 'Maple', kind: DEPENDENCY_NODE_TYPE_PROTOCOL },
    ],
  },
}
