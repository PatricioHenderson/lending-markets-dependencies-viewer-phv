export type ControlStep =
  | { type: 'proxy-admin'; address: string }
  | { type: 'timelock'; address: string; delaySeconds: number }
  | { type: 'safe'; address: string; threshold: number; owners: number }
  | { type: 'eoa'; address: string }
  | { type: 'contract'; address: string }

export type ContractCapabilities = {
  upgradeable: boolean
  pausable: boolean
  mintable: boolean
  blacklist: boolean
}

export type ContractControlMetadata = {
  address: string
  chainId: number
  isContract: boolean
  isProxy: boolean
  proxyType?: 'eip1967' | 'zeppelinos-legacy' | 'beacon' | 'minimal' | 'unknown'
  implementation?: string
  controlChain: ControlStep[]
  capabilities: ContractCapabilities
  paused?: boolean
  inspectedAt: string
}
