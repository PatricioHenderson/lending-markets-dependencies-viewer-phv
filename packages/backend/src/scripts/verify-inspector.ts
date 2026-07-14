import { Interface, JsonRpcProvider } from 'ethers'
import { ContractInspector } from '../inspector/ContractInspector'
import type { ContractControlMetadata } from '../inspector/types'
import { execSync } from 'child_process'

const RPC_URL = 'https://ethereum-rpc.publicnode.com'
const CHAIN_ID = 1
const SYMBOL_INTERFACE = new Interface(['function symbol() view returns (string)'])

// A well-known, permanently unspendable burn address: guaranteed to have zero code and no
// EIP-7702 delegation (unlike some famous EOAs, which can acquire delegated code over time).
const EOA_ADDRESS = '0x000000000000000000000000000000000000dEaD'

const CASES: Array<{ label: string; address: string; expectedSymbol: string | null }> = [
  { label: 'WETH', address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', expectedSymbol: 'WETH' },
  { label: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', expectedSymbol: 'USDC' },
  { label: 'aEthUSDC (aToken)', address: '0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c', expectedSymbol: 'aEthUSDC' },
  { label: 'EOA (burn address)', address: EOA_ADDRESS, expectedSymbol: null },
]

let failures = 0

function pass(message: string): void {
  console.log(`PASS: ${message}`)
}

function fail(message: string): void {
  failures++
  console.error(`FAIL: ${message}`)
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)),
  ])
}

async function validateAddressesOnChain(): Promise<boolean> {
  const provider = new JsonRpcProvider(RPC_URL)

  try {
    await withTimeout(provider.getBlockNumber(), 8000, 'RPC connectivity check')
  } catch (error) {
    console.error(`FAIL: RPC connectivity failed, cannot proceed with mainnet verification: ${(error as Error).message}`)
    failures++
    provider.destroy()
    return false
  }

  for (const testCase of CASES) {
    try {
      const code = await withTimeout(provider.getCode(testCase.address), 8000, 'getCode')
      if (testCase.expectedSymbol === null) {
        if (code === '0x') {
          pass(`${testCase.label} (${testCase.address}) has no code, as expected.`)
        } else {
          fail(`${testCase.label} (${testCase.address}) was expected to have no code, but getCode returned ${code}.`)
        }
        continue
      }

      const data = SYMBOL_INTERFACE.encodeFunctionData('symbol', [])
      const result = await withTimeout(provider.call({ to: testCase.address, data }), 8000, 'symbol() call')
      const [symbol] = SYMBOL_INTERFACE.decodeFunctionResult('symbol', result)
      if (symbol === testCase.expectedSymbol) {
        pass(`On-chain symbol() for ${testCase.label} (${testCase.address}) matches: "${symbol}".`)
      } else {
        fail(`On-chain symbol() for ${testCase.label} (${testCase.address}) returned "${symbol}", expected "${testCase.expectedSymbol}".`)
      }
    } catch (error) {
      fail(`Could not validate ${testCase.label} (${testCase.address}): ${(error as Error).message}`)
    }
  }

  provider.destroy()
  return true
}

function describeChain(controlChain: ContractControlMetadata['controlChain']): string {
  if (controlChain.length === 0) return '(empty)'
  return controlChain
    .map((step) => {
      if (step.type === 'safe') return `Safe ${step.threshold}/${step.owners} (${step.address})`
      if (step.type === 'timelock') return `Timelock ${(step.delaySeconds / 3600).toFixed(1)}h (${step.address})`
      if (step.type === 'proxy-admin') return `ProxyAdmin (${step.address})`
      if (step.type === 'eoa') return `EOA (${step.address})`
      return `Contract (${step.address})`
    })
    .join(' -> ')
}

async function runInspectorExpectations(): Promise<void> {
  const inspector = new ContractInspector()

  const weth = await inspector.inspect(CHAIN_ID, CASES[0].address)
  console.log(`\nWETH inspection: ${JSON.stringify(weth, null, 2)}`)
  if (weth.isContract && !weth.isProxy) {
    pass('WETH: isContract=true, isProxy=false.')
  } else {
    fail(`WETH: expected isContract=true, isProxy=false, got isContract=${weth.isContract}, isProxy=${weth.isProxy}.`)
  }
  if (!weth.capabilities.upgradeable && !weth.capabilities.pausable && !weth.capabilities.mintable && !weth.capabilities.blacklist) {
    pass('WETH: no capabilities detected.')
  } else {
    fail(`WETH: expected no capabilities, got ${JSON.stringify(weth.capabilities)}.`)
  }
  if (weth.controlChain.length === 0 || weth.controlChain[0]?.type === 'contract') {
    pass(`WETH: controlChain is empty or "contract" as expected: ${describeChain(weth.controlChain)}`)
  } else {
    fail(`WETH: expected empty controlChain or "contract", got ${describeChain(weth.controlChain)}.`)
  }

  const usdc = await inspector.inspect(CHAIN_ID, CASES[1].address)
  console.log(`\nUSDC inspection: ${JSON.stringify(usdc, null, 2)}`)
  if (usdc.isProxy && usdc.proxyType === 'zeppelinos-legacy') {
    pass('USDC: isProxy=true, proxyType=zeppelinos-legacy.')
  } else {
    fail(`USDC: expected isProxy=true, proxyType=zeppelinos-legacy, got isProxy=${usdc.isProxy}, proxyType=${usdc.proxyType}.`)
  }
  if (usdc.capabilities.pausable && usdc.capabilities.mintable && usdc.capabilities.blacklist) {
    pass('USDC: pausable, mintable, and blacklist capabilities all detected.')
  } else {
    fail(`USDC: expected pausable/mintable/blacklist all true, got ${JSON.stringify(usdc.capabilities)}.`)
  }
  console.log(`USDC control chain: ${describeChain(usdc.controlChain)}`)

  const aToken = await inspector.inspect(CHAIN_ID, CASES[2].address)
  console.log(`\naEthUSDC inspection: ${JSON.stringify(aToken, null, 2)}`)
  if (aToken.isProxy && aToken.proxyType === 'eip1967') {
    pass('aEthUSDC: isProxy=true, proxyType=eip1967.')
  } else {
    fail(`aEthUSDC: expected isProxy=true, proxyType=eip1967, got isProxy=${aToken.isProxy}, proxyType=${aToken.proxyType}.`)
  }
  if (aToken.capabilities.upgradeable) {
    pass('aEthUSDC: upgradeable=true.')
  } else {
    fail('aEthUSDC: expected upgradeable=true.')
  }
  console.log(`aEthUSDC control chain: ${describeChain(aToken.controlChain)}`)

  const eoa = await inspector.inspect(CHAIN_ID, EOA_ADDRESS)
  console.log(`\nEOA inspection: ${JSON.stringify(eoa, null, 2)}`)
  if (!eoa.isContract) {
    pass('EOA (burn address): isContract=false.')
  } else {
    fail(`EOA (burn address): expected isContract=false, got isContract=${eoa.isContract}.`)
  }
}

async function verifyRegistryStillPasses(): Promise<void> {
  try {
    execSync('npx tsx src/scripts/verify-registry.ts', { stdio: 'inherit', cwd: __dirname + '/../..' })
    pass('verify-registry.ts still passes.')
  } catch {
    fail('verify-registry.ts failed.')
  }
}

async function main(): Promise<void> {
  const connected = await validateAddressesOnChain()
  if (!connected) {
    console.error(`\n${failures} check(s) failed (RPC unreachable, could not run inspector expectations).`)
    process.exit(1)
  }

  await runInspectorExpectations()
  await verifyRegistryStillPasses()

  if (failures > 0) {
    console.error(`\n${failures} check(s) failed.`)
    process.exit(1)
  }
  console.log('\nAll checks passed.')
}

main().catch((error) => {
  console.error('Unexpected error while running verification:', error)
  process.exit(1)
})
