import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import type { TokenDependency } from '../graph/types'

const SUGGESTIONS_FILE = join(__dirname, '..', '..', 'data', 'llm-suggested-tokens.json')

type SuggestionEntry = {
  response: { tokenType: string; dependencies: TokenDependency[] }
  model: string
  chain: string
  firstSeen: string
  lastSeen: string
}

export function recordLlmSuggestion(
  normalizedSymbol: string,
  response: { tokenType: string; dependencies: TokenDependency[] },
  model: string,
  chain: string,
  now: string,
): void {
  try {
    const dir = dirname(SUGGESTIONS_FILE)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

    const suggestions: Record<string, SuggestionEntry> = existsSync(SUGGESTIONS_FILE)
      ? JSON.parse(readFileSync(SUGGESTIONS_FILE, 'utf-8'))
      : {}

    const prior = suggestions[normalizedSymbol]
    suggestions[normalizedSymbol] = {
      response,
      model,
      chain,
      firstSeen: prior?.firstSeen ?? now,
      lastSeen: now,
    }

    writeFileSync(SUGGESTIONS_FILE, JSON.stringify(suggestions, null, 2))
  } catch (error) {
    console.error('Failed to persist LLM-suggested token dependencies:', error)
  }
}
