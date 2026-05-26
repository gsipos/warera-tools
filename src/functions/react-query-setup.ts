import { QueryClient } from '@tanstack/react-query'
import { useLoadingState } from '@/hooks/use-loading-state'

export const DEFAULT_QUERY_STALE_TIME = 1 * 60 * 60 * 1000 // 1 hour
export const LONG_QUERY_STALE_TIME = 6 * 60 * 60 * 1000 // 6 hours

const exponentialBackoff = (attemptIndex: number) => {
  useLoadingState.getState().onRequestRetry()
  return Math.min(1_000 * 2 ** attemptIndex, 30_000)
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 5 * 60 * 1000, // 5 minutes
      staleTime: DEFAULT_QUERY_STALE_TIME,
      networkMode: 'offlineFirst',
      retry: 5,
      retryDelay: exponentialBackoff,
      experimental_prefetchInRender: true,
    },
  },
})
