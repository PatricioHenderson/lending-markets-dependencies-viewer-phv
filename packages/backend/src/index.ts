import 'dotenv/config'
import express, { type NextFunction, type Request, type Response } from 'express'
import { LendingMarketGraphBuilder, SUPPORTED_PROTOCOLS } from './graph/LendingMarketGraphBuilder'
import type { MarketGraphRequest } from './graph/types'
import { ContractInspector } from './inspector/ContractInspector'

const marketGraphBuilder = new LendingMarketGraphBuilder()
const contractInspector = new ContractInspector()

const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/

const DEFAULT_PORT = 4000
const DEFAULT_HOST = '127.0.0.1'
const JSON_LIMIT = '1mb'

const app = express()

app.use(express.json({ limit: JSON_LIMIT }))
app.use(cors)

app.get('/health', (_request, response) => {
  response.json({ ok: true })
})

app.get('/api/protocols', (_request, response) => {
  response.json({ protocols: SUPPORTED_PROTOCOLS })
})

app.get('/api/graph', asyncHandler(async (request, response) => {
  const graph = await marketGraphBuilder.build(readGraphRequest(request.query))
  response.json(graph)
}))

app.post('/api/graph', asyncHandler(async (request, response) => {
  const graph = await marketGraphBuilder.build(readGraphRequest(request.body))
  response.json(graph)
}))

app.get('/api/inspect', asyncHandler(async (request, response) => {
  const { chainId, address } = readInspectRequest(request.query)
  const metadata = await contractInspector.inspect(chainId, address)
  response.json(metadata)
}))

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  const message = error instanceof Error ? error.message : String(error)
  response.status(400).json({ error: message })
})

const port = Number(process.env.PORT || DEFAULT_PORT)
const host = process.env.HOST || DEFAULT_HOST

const server = app.listen(port, host, () => {
  console.log(`Backend listening on http://${host}:${port}`)
})

server.on('error', (error) => {
  console.error(error)
  process.exitCode = 1
})

function cors(request: Request, response: Response, next: NextFunction): void {
  response.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*')
  response.setHeader('Access-Control-Allow-Headers', 'content-type')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')

  if (request.method === 'OPTIONS') {
    response.sendStatus(204)
    return
  }

  next()
}

function readGraphRequest(source: unknown): MarketGraphRequest {
  const record = isRecord(source) ? source : {}
  const protocol = readString(record.protocol, 'protocol')
  const chainId = readString(record.chainId, 'chainId')
  const marketId = readString(record.marketId, 'marketId')
  const llm = typeof record.llm === 'string' ? record.llm : undefined

  return { protocol, chainId, marketId, llm }
}

function readInspectRequest(source: unknown): { chainId: number; address: string } {
  const record = isRecord(source) ? source : {}
  const address = readString(record.address, 'address')
  if (!ADDRESS_PATTERN.test(address)) throw new Error('address must be a valid 0x-prefixed 20-byte hex address.')

  const chainIdRaw = readString(record.chainId, 'chainId')
  const chainId = Number(chainIdRaw)
  if (!Number.isInteger(chainId) || chainId <= 0) throw new Error(`Invalid chainId "${chainIdRaw}".`)

  return { chainId, address }
}

function readString(value: unknown, field: string): string {
  if (typeof value === 'string' && value.trim()) return value
  throw new Error(`${field} is required.`)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function asyncHandler(
  handler: (request: Request, response: Response) => Promise<void>,
): (request: Request, response: Response, next: NextFunction) => void {
  return (request, response, next) => {
    handler(request, response).catch(next)
  }
}
