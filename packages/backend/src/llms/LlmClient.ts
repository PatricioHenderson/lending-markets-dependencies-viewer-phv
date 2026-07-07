import { AnthropicClient } from './AnthropicClient'
import { OpenAIClient } from './OpenAIClient'
import { OpenRouterClient } from './OpenRouterClient'
import { DEFAULT_LLM_PROVIDER, LLM_PROVIDER_CLAUDE, LLM_PROVIDER_OPENROUTER, type LlmProvider } from './providers'

export interface LlmJsonRequest {
  instructions: string
  payload: unknown
  schema: object
  name: string
}

export abstract class LlmClient {
  static create(provider: LlmProvider = DEFAULT_LLM_PROVIDER): LlmClient {
    if (provider === LLM_PROVIDER_CLAUDE) return new AnthropicClient()
    if (provider === LLM_PROVIDER_OPENROUTER) return new OpenRouterClient()
    return new OpenAIClient()
  }

  abstract requestJson<T>(request: LlmJsonRequest): Promise<T>
}
