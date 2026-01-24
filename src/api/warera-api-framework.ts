import { chunkArray } from '@/functions/arrays'
import { useLoadingState } from '@/hooks/use-loading-state'
import { InfiniteData, useInfiniteQuery, UseInfiniteQueryResult, useQueries, useQuery } from '@tanstack/react-query'
import pThrottle from 'p-throttle'
import { useEffect } from 'react'
import { WarEra } from 'warera-api'
import pLimit from 'p-limit'

const warEraApiUrl = 'https://api2.warera.io/trpc/'

type Input = Record<string, unknown>

interface TrpcBatchEntry {
  endpoint: string
  input: Input
}

export const getApiUrl = (endpoint: string, input?: Input) => {
  const url = new URL(endpoint, warEraApiUrl)
  if (input) {
    url.searchParams.set('input', JSON.stringify(input))
  }

  return url.toString()
}

const getBatchApiUrl = (entries: TrpcBatchEntry[]) => {
  const url = new URL(entries.map((e) => e.endpoint).join(','), warEraApiUrl)
  url.searchParams.set('batch', '1')

  const inputObj: Record<number, Input> = {}
  entries.forEach((e, index) => (inputObj[index] = e.input))
  url.searchParams.set('input', JSON.stringify(inputObj))

  return url.toString()
}

const apiFetchLimit = pThrottle({
  limit: 150,
  interval: 1000,
  onDelay: () => useLoadingState.getState().onRequestDelay(),
})

const apiConcurrencyLimit = pLimit(10)

export const warEraBaseApiFetch = async <TData>(endPoint: string) => {
  useLoadingState.getState().addItems(1)
  const response = await apiFetchLimit(() =>
    apiConcurrencyLimit(() =>
      fetch(endPoint, {
        headers: {
          'X-API-Key': import.meta.env.VITE_WARERA_DEFAULT_API_KEY,
        },
      }),
    ),
  )()
  const data = (await response.json()) as TData
  useLoadingState.getState().finishItems(1)
  return data
}

export const warEraApiFetch = async <TData>(endPoint: string) => {
  const response = await warEraBaseApiFetch<WarEra.ApiResponse<TData>>(endPoint)
  return response.result.data
}

export const useWarEraApiQuery = <TData, Input extends Record<string, unknown> = {}>(
  fragment: string,
  input?: Input,
) => {
  const loadingState = useLoadingState()
  return useQuery<TData>({
    queryKey: [fragment, input],
    queryFn: async () => {
      loadingState.addItems(1)
      const result = await warEraApiFetch<TData>(getApiUrl(fragment, input))
      loadingState.finishItems(1)
      return result
    },
  })
}

export const usePaginatedWarEraApiQuery = <TData, Input extends Record<string, unknown> = {}>(
  fragment: string,
  input?: Input & WarEra.PageableOptions,
) => {
  return useInfiniteQuery<WarEra.Paginated<TData>>({
    queryKey: [fragment, input],
    queryFn: async ({ pageParam }) => {
      return warEraApiFetch<WarEra.Paginated<TData>>(
        getApiUrl(fragment, {
          ...input,
          cursor: pageParam ?? '',
          limit: input?.limit ?? 50,
        }),
      )
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  })
}

export const useWarEraApiBatchQuery = <TData>(entries: TrpcBatchEntry[]) => {
  const chunks = chunkArray(entries, 50)
  const loadingState = useLoadingState()

  return useQueries({
    queries: chunks.map((chunk) => ({
      queryKey: ['batch', chunk],
      queryFn: async () => {
        loadingState.addItems(1)
        const result = await warEraBaseApiFetch<WarEra.BatchedApiResponse<TData>>(getBatchApiUrl(chunk))
        loadingState.finishItems(1)
        return (result ?? []).map((r) => r.result.data)
      },
      enabled: entries.length > 0,
    })),
    combine: (results) => ({
      data: results
        .flat()
        .map((q) => q.data)
        .flat()
        .filter((d) => d !== undefined) as TData[],
      queries: results,
    }),
  })
}

export const useAllPages = <T>(query: UseInfiniteQueryResult<InfiniteData<WarEra.Paginated<T>>>) => {
  useEffect(() => {
    let isMounted = true

    const loadAllPages = async () => {
      while (query.hasNextPage && isMounted && !query.isFetchingNextPage) {
        await query.fetchNextPage({ cancelRefetch: false })
      }
    }

    if (!query.isLoading && !query.error) {
      loadAllPages()
    }

    return () => {
      isMounted = false
    }
  }, [query])
}
