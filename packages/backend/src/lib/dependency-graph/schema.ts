import {
  DEPENDENCY_NODE_TYPES,
} from './types'

export const TOKEN_DEPENDENCIES_NAME = 'token_dependencies'

export const TOKEN_DEPENDENCIES_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['symbol', 'tokenType', 'dependencies'],
  properties: {
    symbol: { type: 'string' },
    tokenType: { type: 'string', enum: DEPENDENCY_NODE_TYPES },
    dependencies: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['label', 'kind'],
        properties: {
          label: { type: 'string' },
          kind: { type: 'string', enum: DEPENDENCY_NODE_TYPES },
        },
      },
    },
  },
} as const
