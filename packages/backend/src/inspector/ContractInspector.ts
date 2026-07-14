import { Interface, type JsonRpcProvider } from 'ethers'
import { getRpcProvider } from './rpc'
import { readCachedInspection, writeCachedInspection } from './cache'
import {
  CAPABILITY_SELECTOR_GROUPS,
  EIP1967_ADMIN_SLOT,
  EIP1967_BEACON_SLOT,
  EIP1967_IMPLEMENTATION_SLOT,
  MINIMAL_PROXY_PREFIX,
  MINIMAL_PROXY_SUFFIX,
  ZEPPELINOS_LEGACY_IMPLEMENTATION_SLOT,
} from './constants'
import type { ContractCapabilities, ContractControlMetadata, ControlStep } from './types'

const MAX_CONTROL_CHAIN_DEPTH = 5

const SAFE_INTERFACE = new Interface([
  'function getThreshold() view returns (uint256)',
  'function getOwners() view returns (address[])',
])
const TIMELOCK_INTERFACE = new Interface([
  'function getMinDelay() view returns (uint256)',
  'function delay() view returns (uint256)',
])
const OWNER_INTERFACE = new Interface(['function owner() view returns (address)'])
const PAUSED_INTERFACE = new Interface(['function paused() view returns (bool)'])

export class ContractInspector {
  async inspect(chainId: number, address: string): Promise<ContractControlMetadata> {
    const cached = readCachedInspection(chainId, address)
    if (cached) return cached

    const result = await this.runInspection(chainId, address)
    writeCachedInspection(chainId, address, result)
    return result
  }

  private async runInspection(chainId: number, address: string): Promise<ContractControlMetadata> {
    const provider = getRpcProvider(chainId)
    const code = await provider.getCode(address)

    if (code === '0x') {
      return {
        address,
        chainId,
        isContract: false,
        isProxy: false,
        controlChain: [],
        capabilities: { upgradeable: false, pausable: false, mintable: false, blacklist: false },
        inspectedAt: new Date().toISOString(),
      }
    }

    const [implementationSlot, adminSlot, beaconSlot, zeppelinosSlot] = await Promise.all([
      provider.getStorage(address, EIP1967_IMPLEMENTATION_SLOT),
      provider.getStorage(address, EIP1967_ADMIN_SLOT),
      provider.getStorage(address, EIP1967_BEACON_SLOT),
      provider.getStorage(address, ZEPPELINOS_LEGACY_IMPLEMENTATION_SLOT),
    ])

    const { isProxy, proxyType, implementation } = this.resolveProxy(code, implementationSlot, beaconSlot, zeppelinosSlot)

    const bytecodeToScan = implementation ? await provider.getCode(implementation) : code
    const capabilities = this.scanCapabilities(bytecodeToScan, isProxy)

    let paused: boolean | undefined
    if (capabilities.pausable) {
      paused = await this.tryCall<boolean>(provider, address, PAUSED_INTERFACE, 'paused')
    }

    const adminAddress = isZeroSlot(adminSlot) ? undefined : addressFromSlot(adminSlot)
    const controlChain = await this.buildControlChain(provider, address, adminAddress)

    return {
      address,
      chainId,
      isContract: true,
      isProxy,
      ...(proxyType ? { proxyType } : {}),
      ...(implementation ? { implementation } : {}),
      controlChain,
      capabilities,
      ...(paused !== undefined ? { paused } : {}),
      inspectedAt: new Date().toISOString(),
    }
  }

  private resolveProxy(
    code: string,
    implementationSlot: string,
    beaconSlot: string,
    zeppelinosSlot: string,
  ): { isProxy: boolean; proxyType?: ContractControlMetadata['proxyType']; implementation?: string } {
    if (!isZeroSlot(implementationSlot)) {
      return { isProxy: true, proxyType: 'eip1967', implementation: addressFromSlot(implementationSlot) }
    }
    // Simplification: a beacon proxy's slot points at a beacon contract (which itself exposes
    // implementation()), not the implementation directly. v1 treats it as if it were the
    // implementation address, matching the "known limits" heuristic nature of this inspector.
    if (!isZeroSlot(beaconSlot)) {
      return { isProxy: true, proxyType: 'beacon', implementation: addressFromSlot(beaconSlot) }
    }
    if (!isZeroSlot(zeppelinosSlot)) {
      return { isProxy: true, proxyType: 'zeppelinos-legacy', implementation: addressFromSlot(zeppelinosSlot) }
    }

    const minimalTarget = extractMinimalProxyTarget(code)
    if (minimalTarget) {
      return { isProxy: true, proxyType: 'minimal', implementation: minimalTarget }
    }

    return { isProxy: false }
  }

  private scanCapabilities(bytecode: string, isProxy: boolean): ContractCapabilities {
    const hasSelector = (selector: string): boolean => hasPush4Selector(bytecode, selector)
    const upgradeSelectorPresent = CAPABILITY_SELECTOR_GROUPS.upgradeable.some(hasSelector)

    return {
      upgradeable: isProxy || upgradeSelectorPresent,
      pausable: CAPABILITY_SELECTOR_GROUPS.pausable.some(hasSelector),
      mintable: CAPABILITY_SELECTOR_GROUPS.mintable.some(hasSelector),
      blacklist: CAPABILITY_SELECTOR_GROUPS.blacklist.some(hasSelector),
    }
  }

  private async buildControlChain(
    provider: JsonRpcProvider,
    address: string,
    adminAddress: string | undefined,
  ): Promise<ControlStep[]> {
    const start = adminAddress ?? (await this.tryCall<string>(provider, address, OWNER_INTERFACE, 'owner'))
    if (!start) return []

    return this.resolveControlChain(provider, start, 0)
  }

  private async resolveControlChain(provider: JsonRpcProvider, address: string, depth: number): Promise<ControlStep[]> {
    if (depth >= MAX_CONTROL_CHAIN_DEPTH) return []

    const code = await provider.getCode(address)
    if (code === '0x') return [{ type: 'eoa', address }]

    const threshold = await this.tryCall<bigint>(provider, address, SAFE_INTERFACE, 'getThreshold')
    const owners = await this.tryCall<string[]>(provider, address, SAFE_INTERFACE, 'getOwners')
    if (threshold !== undefined && owners !== undefined) {
      return [{ type: 'safe', address, threshold: Number(threshold), owners: owners.length }]
    }

    const minDelay = await this.tryCall<bigint>(provider, address, TIMELOCK_INTERFACE, 'getMinDelay')
    const delay = minDelay ?? (await this.tryCall<bigint>(provider, address, TIMELOCK_INTERFACE, 'delay'))
    if (delay !== undefined) {
      return [{ type: 'timelock', address, delaySeconds: Number(delay) }]
    }

    const owner = await this.tryCall<string>(provider, address, OWNER_INTERFACE, 'owner')
    if (owner !== undefined) {
      const rest = await this.resolveControlChain(provider, owner, depth + 1)
      return [{ type: 'proxy-admin', address }, ...rest]
    }

    return [{ type: 'contract', address }]
  }

  private async tryCall<T>(
    provider: JsonRpcProvider,
    address: string,
    iface: Interface,
    fn: string,
  ): Promise<T | undefined> {
    try {
      const data = iface.encodeFunctionData(fn, [])
      const result = await provider.call({ to: address, data })
      const decoded = iface.decodeFunctionResult(fn, result)
      return decoded[0] as T
    } catch {
      return undefined
    }
  }
}

function isZeroSlot(value: string): boolean {
  return BigInt(value) === 0n
}

function addressFromSlot(value: string): string {
  return `0x${value.slice(-40)}`
}

function hasPush4Selector(bytecodeHex: string, selector: string): boolean {
  const needle = `63${selector.slice(2).toLowerCase()}`
  return bytecodeHex.toLowerCase().includes(needle)
}

function extractMinimalProxyTarget(code: string): string | undefined {
  const hex = code.slice(2).toLowerCase()
  const prefixIndex = hex.indexOf(MINIMAL_PROXY_PREFIX)
  if (prefixIndex === -1) return undefined

  const addressStart = prefixIndex + MINIMAL_PROXY_PREFIX.length
  const addressHex = hex.slice(addressStart, addressStart + 40)
  const suffix = hex.slice(addressStart + 40, addressStart + 40 + MINIMAL_PROXY_SUFFIX.length)
  if (suffix !== MINIMAL_PROXY_SUFFIX) return undefined

  return `0x${addressHex}`
}
