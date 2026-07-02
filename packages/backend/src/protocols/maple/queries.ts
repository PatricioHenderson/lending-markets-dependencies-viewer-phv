export const MAPLE_POOLS_QUERY = `
  query GetMaplePools {
    poolV2S(where: { syrupRouter_not: null }) {
      id
      name
      asset {
        symbol
      }
    }
  }
`
