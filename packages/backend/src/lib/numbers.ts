import { formatUnits as ethersFormatUnits, getBigInt } from 'ethers'

export type BigNumber = bigint | number | string

export function toBigInt(value: BigNumber): bigint {
  try {
    return getBigInt(value)
  } catch {
    return 0n
  }
}

export function wadToRatio(value: BigNumber): number {
  return Number(ethersFormatUnits(value, 18))
}

export function numeric(value: BigNumber): number {
  return Number(value)
}

