// The localhost fallback only applies in local dev, where the backend normally runs
// alongside `yarn dev`. In a deployed build without NEXT_PUBLIC_API_URL set, falling back
// to localhost would make the visitor's browser attempt a cross-origin request into their
// own machine — triggering an OS-level "access other devices/services" permission prompt
// for no reason, since nothing is listening there. Returning undefined lets callers skip
// the fetch entirely instead.
export function getApiBaseUrl(): string | undefined {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL
  if (process.env.NODE_ENV === "development") return "http://localhost:4000"
  return undefined
}
