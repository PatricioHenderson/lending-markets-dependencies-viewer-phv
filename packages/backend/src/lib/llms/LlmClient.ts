import { AnthropicClient } from './AnthropicClient'
import { OpenAIClient } from './OpenAIClient'
import { DEFAULT_LLM_PROVIDER, LLM_PROVIDER_CLAUDE, type LlmProvider } from './providers'

export interface LlmJsonRequest {
  instructions: string
  payload: unknown
  schema: object
  name: string
}

export abstract class LlmClient {
  static create(provider: LlmProvider = DEFAULT_LLM_PROVIDER): LlmClient {
    return provider === LLM_PROVIDER_CLAUDE ? new AnthropicClient() : new OpenAIClient()
  }

  abstract requestJson<T>(request: LlmJsonRequest): Promise<T>
}
