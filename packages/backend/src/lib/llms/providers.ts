export const LLM_PROVIDER_CLAUDE = 'claude'
export const LLM_PROVIDER_OPENAI = 'openai'
export const DEFAULT_LLM_PROVIDER = LLM_PROVIDER_OPENAI

export const LLM_PROVIDERS = [LLM_PROVIDER_CLAUDE, LLM_PROVIDER_OPENAI] as const

export type LlmProvider = typeof LLM_PROVIDERS[number]

export function normalizeLlmProvider(value: string | undefined): LlmProvider {
  if (value === undefined || value === DEFAULT_LLM_PROVIDER) return DEFAULT_LLM_PROVIDER
  if (value === LLM_PROVIDER_CLAUDE) return LLM_PROVIDER_CLAUDE

  throw new Error(`Invalid LLM provider "${value}". Use ${LLM_PROVIDERS.join(' or ')}.`)
}
