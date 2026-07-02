import type { GraphQLResponse, GraphQLVariables } from './types'

export class GraphQLClient {
  constructor(private readonly endpoint: string) {}

  async request<TData>(query: string, variables: GraphQLVariables = {}): Promise<TData> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    })

    const body = await response.json().catch(() => null) as GraphQLResponse<TData> | null

    if (!body) throw new Error('GraphQL API returned an invalid JSON response')

    if (body.errors && body.errors.length > 0) throw new Error(body.errors.map((error) => error.message).join('; '))

    if (!response.ok) throw new Error(`GraphQL API returned HTTP ${response.status}`)

    if (!body.data) throw new Error('GraphQL API response did not include data')

    return body.data
  }
}
