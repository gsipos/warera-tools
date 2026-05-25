import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query'
import { IMMUTABLE_DATA_STALE_TIME } from './persisted-client'

/**
 * Hook for queries that should be persisted to IndexedDB.
 * Applies aggressive staleTime suitable for immutable historical data.
 *
 * Must be used within a <PersistedDataProvider> subtree to benefit
 * from the dedicated persisted QueryClient.
 *
 * Overrides can be passed via options — the immutable defaults are
 * applied as a baseline and can be narrowed (but not widened) by callers.
 */
export function usePersistedQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
  return useQuery<TQueryFnData, TError, TData, TQueryKey>({
    staleTime: IMMUTABLE_DATA_STALE_TIME,
    gcTime: 24 * 60 * 60 * 1000,
    networkMode: 'offlineFirst',
    ...options,
  })
}
