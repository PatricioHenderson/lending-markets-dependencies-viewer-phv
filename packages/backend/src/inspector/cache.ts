import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import type { ContractControlMetadata } from './types'

const CACHE_FILE = join(__dirname, '..', '..', 'data', 'contract-inspections.json')
const DEFAULT_TTL_HOURS = 24

const memoryCache = new Map<string, ContractControlMetadata>()

function cacheKey(chainId: number, address: string): string {
  return `${chainId}:${address.toLowerCase()}`
}

function ttlHours(): number {
  const value = Number(process.env.INSPECTOR_CACHE_TTL_HOURS)
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_TTL_HOURS
}

function isFresh(entry: ContractControlMetadata): boolean {
  const ageMs = Date.now() - new Date(entry.inspectedAt).getTime()
  return ageMs < ttlHours() * 60 * 60 * 1000
}

function readDiskCache(): Record<string, ContractControlMetadata> {
  try {
    return existsSync(CACHE_FILE) ? JSON.parse(readFileSync(CACHE_FILE, 'utf-8')) : {}
  } catch {
    return {}
  }
}

export function readCachedInspection(chainId: number, address: string): ContractControlMetadata | undefined {
  const key = cacheKey(chainId, address)

  const inMemory = memoryCache.get(key)
  if (inMemory && isFresh(inMemory)) return inMemory

  const onDisk = readDiskCache()[key]
  if (onDisk && isFresh(onDisk)) {
    memoryCache.set(key, onDisk)
    return onDisk
  }

  return undefined
}

export function writeCachedInspection(chainId: number, address: string, result: ContractControlMetadata): void {
  const key = cacheKey(chainId, address)
  memoryCache.set(key, result)

  try {
    const dir = dirname(CACHE_FILE)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

    const disk = readDiskCache()
    disk[key] = result
    writeFileSync(CACHE_FILE, JSON.stringify(disk, null, 2))
  } catch (error) {
    console.error('Failed to persist contract inspection cache:', error)
  }
}
