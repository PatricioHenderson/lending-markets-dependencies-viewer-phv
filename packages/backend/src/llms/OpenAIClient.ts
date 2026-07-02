import type { LlmClient, LlmJsonRequest } from './LlmClient'

const DEFAULT_MODEL = 'gpt-5.5'
const OPENAI_API_URL = 'https://api.openai.com/v1/responses'

export interface OpenAIClientOptions {
  apiKey?: string
  model?: string
  baseUrl?: string
}

export class OpenAIClient implements LlmClient {
  private readonly apiKey: string
  private readonly model: string
  private readonly baseUrl: string

  constructor(options: OpenAIClientOptions = {}) {
    this.apiKey = (options.apiKey || process.env.OPENAI_API_KEY || '').trim()
    this.model = options.model || process.env.OPENAI_MODEL || DEFAULT_MODEL
    this.baseUrl = options.baseUrl || OPENAI_API_URL

    if (!this.apiKey) throw new Error('OPENAI_API_KEY must be set when an OpenAI LLM request is needed.')
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
        instructions: request.instructions,
        input: JSON.stringify(request.payload, this.jsonReplacer),
        text: {
          format: {
            type: 'json_schema',
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
      throw new Error(`OpenAI request failed: ${response.status} ${response.statusText}: ${body}`)
    }

    const payload = await response.json() as {
      output_text?: string
      output?: Array<{ content?: Array<{ text?: string }> }>
    }
    const outputText = payload.output_text || this.extractOutputText(payload.output)

    if (!outputText) throw new Error('OpenAI response did not include output text.')

    return JSON.parse(outputText) as T
  }

  private jsonReplacer(_key: string, value: unknown): unknown {
    return typeof value === 'bigint' ? value.toString() : value
  }

  private extractOutputText(output?: Array<{ content?: Array<{ text?: string }> }>): string | undefined {
    for (const item of output || []) {
      for (const content of item.content || []) {
        if (typeof content.text === 'string' && content.text.length > 0) return content.text
      }
    }

    return undefined
  }
}
