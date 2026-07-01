import type { LlmClient, LlmJsonRequest } from './LlmClient'

const DEFAULT_MODEL = 'claude-sonnet-4-20250514'
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'

export interface AnthropicClientOptions {
  apiKey?: string
  model?: string
  baseUrl?: string
}

export class AnthropicClient implements LlmClient {
  private readonly apiKey: string
  private readonly model: string
  private readonly baseUrl: string

  constructor(options: AnthropicClientOptions = {}) {
    this.apiKey = (options.apiKey || process.env.ANTHROPIC_API_KEY || '').trim()
    this.model = options.model || process.env.ANTHROPIC_MODEL || DEFAULT_MODEL
    this.baseUrl = options.baseUrl || ANTHROPIC_API_URL

    if (!this.apiKey) throw new Error('ANTHROPIC_API_KEY must be set when a Claude LLM request is needed.')
  }

  async requestJson<T>(request: LlmJsonRequest): Promise<T> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'anthropic-version': ANTHROPIC_VERSION,
        'content-type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 2048,
        system: request.instructions,
        messages: [
          {
            role: 'user',
            content: JSON.stringify(request.payload, this.jsonReplacer),
          },
        ],
        tools: [
          {
            name: request.name,
            description: 'Return the structured result as JSON.',
            input_schema: request.schema,
          },
        ],
        tool_choice: {
          type: 'tool',
          name: request.name,
        },
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Anthropic request failed: ${response.status} ${response.statusText}: ${body}`)
    }

    const payload = await response.json() as {
      content?: Array<
        | { type: 'text'; text?: string }
        | { type: 'tool_use'; name?: string; input?: unknown }
      >
      stop_reason?: string
    }
    const toolUse = payload.content?.find((item) => item.type === 'tool_use')

    if (toolUse && 'input' in toolUse) return toolUse.input as T

    const textItem = payload.content?.find((item) => item.type === 'text')
    const text = textItem && textItem.type === 'text' ? textItem.text : undefined
    if (text) return JSON.parse(text) as T

    throw new Error(`Anthropic response did not include tool output. stop_reason=${payload.stop_reason || 'unknown'}`)
  }

  private jsonReplacer(_key: string, value: unknown): unknown {
    return typeof value === 'bigint' ? value.toString() : value
  }
}
