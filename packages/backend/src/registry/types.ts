import type { DependencyNodeType, TokenDependency } from '../graph/types'

export type ProtocolEntry = {
  id: string
  label: string
  aliases: string[]
}

export type TokenRegistryEntry = {
  type: DependencyNodeType
  dependencies: TokenDependency[]
  addresses?: Record<number, string>
}
