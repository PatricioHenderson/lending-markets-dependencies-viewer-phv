import { id, keccak256, toBeHex, toUtf8Bytes } from 'ethers'

function selector(signature: string): string {
  return id(signature).slice(0, 10)
}

// EIP-1967 slot = keccak256(label) - 1, stored as a full 32-byte word.
function eip1967Slot(label: string): string {
  return toBeHex(BigInt(keccak256(toUtf8Bytes(label))) - 1n, 32)
}

// EIP-1967 slots (https://eips.ethereum.org/EIPS/eip-1967). Values asserted below against the
// well-known constants so a mistake in this computation fails loudly instead of silently.
export const EIP1967_IMPLEMENTATION_SLOT = eip1967Slot('eip1967.proxy.implementation')
export const EIP1967_ADMIN_SLOT = eip1967Slot('eip1967.proxy.admin')
export const EIP1967_BEACON_SLOT = eip1967Slot('eip1967.proxy.beacon')

// Zeppelinos legacy proxy slot (pre-EIP-1967, still used by USDC). No "- 1" offset.
export const ZEPPELINOS_LEGACY_IMPLEMENTATION_SLOT = keccak256(toUtf8Bytes('org.zeppelinos.proxy.implementation'))

assertSlot(EIP1967_IMPLEMENTATION_SLOT, '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc', 'EIP-1967 implementation slot')
assertSlot(EIP1967_ADMIN_SLOT, '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103', 'EIP-1967 admin slot')
assertSlot(EIP1967_BEACON_SLOT, '0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50', 'EIP-1967 beacon slot')

function assertSlot(computed: string, expected: string, label: string): void {
  if (computed.toLowerCase() !== expected.toLowerCase()) {
    throw new Error(`${label} computation is wrong: got ${computed}, expected ${expected}.`)
  }
}

// Minimal proxy (EIP-1167) bytecode pattern, with the 20-byte target address in the middle.
export const MINIMAL_PROXY_PREFIX = '363d3d373d3d3d363d73'
export const MINIMAL_PROXY_SUFFIX = '5af43d82803e903d91602b57fd5bf3'

export const SELECTORS = {
  owner: selector('owner()'),
  paused: selector('paused()'),
  getThreshold: selector('getThreshold()'),
  getOwners: selector('getOwners()'),
  getMinDelay: selector('getMinDelay()'),
  delay: selector('delay()'),
  symbol: selector('symbol()'),
  upgradeTo: selector('upgradeTo(address)'),
  upgradeToAndCall: selector('upgradeToAndCall(address,bytes)'),
  pause: selector('pause()'),
  mint: selector('mint(address,uint256)'),
  blacklist: selector('blacklist(address)'),
  isBlacklisted: selector('isBlacklisted(address)'),
  addBlackList: selector('addBlackList(address)'),
} as const

// PUSH4 (0x63) + selector: how Solidity's function dispatcher pushes a selector constant
// to compare against msg.sig. Scanning bytecode for this substring is a heuristic proxy for
// "this contract defines a function with this selector."
export const CAPABILITY_SELECTOR_GROUPS: Record<'upgradeable' | 'pausable' | 'mintable' | 'blacklist', string[]> = {
  upgradeable: [SELECTORS.upgradeTo, SELECTORS.upgradeToAndCall],
  pausable: [SELECTORS.pause],
  mintable: [SELECTORS.mint],
  blacklist: [SELECTORS.blacklist, SELECTORS.isBlacklisted, SELECTORS.addBlackList],
}
