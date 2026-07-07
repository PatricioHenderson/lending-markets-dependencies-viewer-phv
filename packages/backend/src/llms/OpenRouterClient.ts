import type { LlmClient, LlmJsonRequest } from './LlmClient'

const DEFAULT_MODEL = 'openai/gpt-4o-mini'
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

export interface OpenRouterClientOptions {
  apiKey?: string
  model?: string
  baseUrl?: string
}

export class OpenRouterClient implements LlmClient {
  private readonly apiKey: string
  private readonly model: string
  private readonly baseUrl: string

  constructor(options: OpenRouterClientOptions = {}) {
    this.apiKey = (options.apiKey || process.env.OPENROUTER_API_KEY || '').trim()
    this.model = options.model || process.env.OPENROUTER_MODEL || DEFAULT_MODEL
    this.baseUrl = options.baseUrl || OPENROUTER_API_URL

    if (!this.apiKey) throw new Error('OPENROUTER_API_KEY must be set when an OpenRouter LLM request is needed.')
  }

  async requestJson<T>(request: LlmJsonRequest): Promise<T> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: request.instructions },
          { role: 'user', content: JSON.stringify(request.payload, this.jsonReplacer) },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: request.name,
            strict: true,
            schema: request.schema,
          },
        },
        temperature: 0,
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`OpenRouter request failed: ${response.status} ${response.statusText}: ${body}`)
    }

    const payload = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const outputText = payload.choices?.[0]?.message?.content

    if (!outputText) throw new Error('OpenRouter response did not include message content.')

    return JSON.parse(outputText) as T
  }

  private jsonReplacer(_key: string, value: unknown): unknown {
    return typeof value === 'bigint' ? value.toString() : value
  }
}
