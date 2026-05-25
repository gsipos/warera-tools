import { useQueries, useQuery } from '@tanstack/react-query'
import { useLoadingState } from '@/hooks/use-loading-state'
import { useRefreshStore } from '@/stores/refresh-store'
import { chunkArray } from '@/functions/arrays'

/**
 * Wraps a tRPC client call in useQuery with loading state tracking.
 * Returns the full UseQueryResult (data, error, isLoading, etc.).
 *
 * Loading state is tracked symmetrically in the queryFn:
 * addItems on start, finishItems on completion (success or error).
 *
 * The refresh epoch from the global RefreshStore is included in the query key
 * so that incrementing the epoch causes all queries to refetch.
 */
export function useAsyncResource<TData>(queryKey: unknown[], queryFn: () => Promise<TData>) {
  const epoch = useRefreshStore((s) => s.epoch)

  return useQuery<TData>({
    queryKey: [...queryKey, { refreshEpoch: epoch }],
    queryFn: async () => {
      useLoadingState.getState().addItems()
      try {
        const data = await queryFn()
        return data
      } finally {
        useLoadingState.getState().finishItems()
      }
    },
  })
}

/**
 * Batch queries with safe chunking and loading state tracking.
 * Chunks items (default 50 per chunk), runs each chunk in parallel via useQueries,
 * and combines results into a flat array.
 *
 * The refresh epoch is included in each chunk's query key so that
 * incrementing the epoch causes all batch queries to refetch.
 *
 * Returns { data: TData[], queries, isLoading, error }.
 */
export function useBatchAsyncResource<TItem, TData>(
  queryKey: unknown[],
  items: TItem[],
  queryFn: (item: TItem) => Promise<TData>,
  options?: { chunkSize?: number },
) {
  const epoch = useRefreshStore((s) => s.epoch)
  const chunkSize = options?.chunkSize ?? 50
  const chunks = chunkArray(items, chunkSize)

  const results = useQueries({
    queries: chunks.map((chunk, chunkIndex) => ({
      queryKey: [...queryKey, 'chunk', chunkIndex, chunk, { refreshEpoch: epoch }],
      queryFn: async () => {
        useLoadingState.getState().addItems()
        try {
          return await Promise.all(chunk.map((item) => queryFn(item)))
        } finally {
          useLoadingState.getState().finishItems()
        }
      },
      enabled: items.length > 0,
    })),
    combine: (queryResults) => {
      const data = queryResults
        .filter((q) => q.isSuccess)
        .flatMap((q) => q.data as TData[])
      const isLoading = queryResults.some((q) => q.isLoading)
      const error = queryResults.find((q) => q.error)?.error ?? null
      return { data, queries: queryResults, isLoading, error }
    },
  })

  return results
}
