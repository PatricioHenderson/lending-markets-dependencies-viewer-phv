import { computeAggregateExposure } from '../lib/graph-exposure'
import { SAMPLE_GRAPH } from '../lib/sample-graph'
import type { ExposureEntry } from '../lib/graph-exposure'

let failures = 0

function pass(message: string): void {
  console.log(`PASS: ${message}`)
}

function fail(message: string): void {
  failures++
  console.error(`FAIL: ${message}`)
}

function findByLabel(entries: ExposureEntry[], label: string): ExposureEntry | undefined {
  return entries.find((e) => e.label === label)
}

const result = computeAggregateExposure(SAMPLE_GRAPH)

console.log(`Total collateral USD: ${result.totalCollateralUsd.toLocaleString()}`)
console.log('\nBy asset (top 10):')
for (const e of result.byAsset.slice(0, 10)) {
  console.log(`  ${e.label.padEnd(20)} $${e.exposureUsd.toLocaleString()}  (${e.pctOfCollateral.toFixed(2)}%)`)
}
console.log('\nBy protocol (top 10):')
for (const e of result.byProtocol.slice(0, 10)) {
  console.log(`  ${e.label.padEnd(20)} $${e.exposureUsd.toLocaleString()}  (${e.pctOfCollateral.toFixed(2)}%)`)
}

// exposure(ETH) ~= WETH + wstETH + weETH + cbETH + rETH, should land in ~45-50% of collateral.
const eth = findByLabel(result.byAsset, 'ETH')
if (eth && eth.pctOfCollateral >= 45 && eth.pctOfCollateral <= 50) {
  pass(`exposure(ETH) = ${eth.pctOfCollateral.toFixed(2)}% (within 45-50%)`)
} else {
  fail(`exposure(ETH) = ${eth?.pctOfCollateral} — expected within 45-50%`)
}

const wsteth = SAMPLE_GRAPH.nodes.find((n) => n.label === 'wstETH')
const weeth = SAMPLE_GRAPH.nodes.find((n) => n.label === 'weETH')
const cbeth = SAMPLE_GRAPH.nodes.find((n) => n.label === 'cbETH')
const reth = SAMPLE_GRAPH.nodes.find((n) => n.label === 'rETH')
if (eth) {
  const wethNode = SAMPLE_GRAPH.nodes.find((n) => n.label === 'WETH')
  const sumUsd =
    (wethNode?.supplyMetrics?.suppliedUsd ?? 0) +
    (wsteth?.supplyMetrics?.suppliedUsd ?? 0) +
    (weeth?.supplyMetrics?.suppliedUsd ?? 0) +
    (cbeth?.supplyMetrics?.suppliedUsd ?? 0) +
    (reth?.supplyMetrics?.suppliedUsd ?? 0)
  if (Math.abs(eth.exposureUsd - sumUsd) < 1) {
    pass(`exposure(ETH) USD (${eth.exposureUsd.toFixed(2)}) matches WETH+wstETH+weETH+cbETH+rETH sum exactly.`)
  } else {
    fail(`exposure(ETH) USD ${eth.exposureUsd} != expected sum ${sumUsd}`)
  }
}

// exposure(Lido) should equal exactly wstETH's suppliedUsd (dedup test: two paths to Lido).
const lido = findByLabel(result.byProtocol, 'Lido')
const wstethUsd = wsteth?.supplyMetrics?.suppliedUsd ?? 0
if (lido && Math.abs(lido.exposureUsd - wstethUsd) < 1) {
  pass(`exposure(Lido) = ${lido.exposureUsd.toFixed(2)} matches wstETH's suppliedUsd exactly (dedup across 2 paths worked).`)
} else {
  fail(`exposure(Lido) = ${lido?.exposureUsd} != expected ${wstethUsd}`)
}

// exposure(Ethena) = PT-sUSDe + PT-USDe (the only two actual collaterals reaching it).
const ethena = findByLabel(result.byProtocol, 'Ethena')
const ptSusde = SAMPLE_GRAPH.nodes.find((n) => n.label === 'PT-sUSDE-5FEB2026')
const ptUsde = SAMPLE_GRAPH.nodes.find((n) => n.label === 'PT-USDe-5FEB2026')
const expectedEthenaUsd = (ptSusde?.supplyMetrics?.suppliedUsd ?? 0) + (ptUsde?.supplyMetrics?.suppliedUsd ?? 0)
if (ethena && Math.abs(ethena.exposureUsd - expectedEthenaUsd) < 1) {
  pass(`exposure(Ethena) = ${ethena.exposureUsd.toFixed(2)} matches PT-sUSDe + PT-USDe sum exactly.`)
} else {
  fail(`exposure(Ethena) = ${ethena?.exposureUsd} != expected ${expectedEthenaUsd}`)
}

// A direct collateral must include itself (distance 0) in its own exposure entry.
const usdcExposure = findByLabel(result.byAsset, 'USDC')
const usdcNode = SAMPLE_GRAPH.nodes.find((n) => n.label === 'USDC')
if (usdcExposure && usdcNode?.supplyMetrics && usdcExposure.exposureUsd >= usdcNode.supplyMetrics.suppliedUsd) {
  pass(`USDC (a direct collateral) includes its own suppliedUsd in its exposure entry.`)
} else {
  fail(`USDC exposure entry missing or too small: ${usdcExposure?.exposureUsd}`)
}

// % denominator sanity: no single entity should exceed the total collateral USD (100%).
const maxPct = Math.max(...result.byAsset.map((e) => e.pctOfCollateral), ...result.byProtocol.map((e) => e.pctOfCollateral))
if (maxPct <= 100.01) {
  pass(`No exposure entry exceeds 100% of total collateral (max: ${maxPct.toFixed(2)}%).`)
} else {
  fail(`An exposure entry exceeds 100%: ${maxPct}`)
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`)
  process.exit(1)
}
console.log('\nAll checks passed.')
