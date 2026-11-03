import { createAPIClient } from '@wareraprojects/api'
import { useLoadingState } from '@/hooks/use-loading-state'

/**
 * Shared tRPC API client instance for the WarEra API.
 *
 * Uses the @wareraprojects/api package which provides:
 * - Automatic request batching
 * - Built-in rate limiting
 * - Automatic retries with exponential backoff
 * - End-to-end TypeScript typing
 */
export const apiClient = createAPIClient({
  apiKey: import.meta.env.VITE_WARERA_DEFAULT_API_KEY,
  url: 'https://api2.warera.io/trpc',
  retry: {
    onRetry: () => {
      useLoadingState.getState().onRequestRetry()
    },
  },
})

// DEV-ONLY: Smoke test to validate client connectivity.
// Uncomment during development to verify the client works:
//
// if (import.meta.env.DEV) {
//   apiClient.country.getAllCountries().then(
//     (countries) => console.log('[api/client] smoke test OK:', countries.length, 'countries'),
//     (err) => console.error('[api/client] smoke test FAILED:', err),
//   )
// }
