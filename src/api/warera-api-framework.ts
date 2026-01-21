import { useLoadingState } from '@/hooks/use-loading-state'
import { InfiniteData, useInfiniteQuery, UseInfiniteQueryResult, useQuery } from '@tanstack/react-query'
import pThrottle from 'p-throttle'
import { useEffect } from 'react'
import { WarEra } from 'warera-api'

const warEraApiUrl = 'https://api2.warera.io/trpc/'

interface TrpcBatchEntry {
  endpoint: string
  input: Record<string, unknown>
}

export const getApiUrl = (endpoint: string, input?: Record<string, unknown>) => {
  const url = new URL(endpoint, warEraApiUrl)
  if (input) {
    url.searchParams.set('input', JSON.stringify(input))
  }

  return url.toString()
}

const getBatchApiUrl = (entries: TrpcBatchEntry[]) => {
  const url = new URL(entries.map((e) => e.endpoint).join(','), warEraApiUrl)
  url.searchParams.set('batch', '1')

  const inputObj: Record<number, string> = {}
  entries.forEach((e, index) => (inputObj[index] = JSON.stringify(e.input)))
  url.searchParams.set('input', JSON.stringify(inputObj))

  return url.toString()
}

const apiFetchLimit = pThrottle({
  limit: 100,
  interval: 1000,
})

export const warEraApiFetch = async <TData>(endPoint: string) => {
  useLoadingState.getState().addItems(1)
  const response = await apiFetchLimit(() =>
    fetch(endPoint, {
      headers: {
        'X-API-Key': import.meta.env.VITE_WARERA_DEFAULT_API_KEY,
      },
    }),
  )()
  const data = (await response.json()) as WarEra.ApiResponse<TData>
  useLoadingState.getState().finishItems(1)
  return data.result.data
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
          cursor: pageParam,
          limit: input?.limit ?? 50,
        }),
      )
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  })
}

export const useWarEraApiBatchQuery = <TData>(entries: TrpcBatchEntry[]) => {
  const loadingState = useLoadingState()
  return useQuery<TData[]>({
    queryKey: ['batch', entries],
    queryFn: async () => {
      loadingState.addItems(1)
      const result = await warEraApiFetch<TData[]>(getBatchApiUrl(entries))
      loadingState.finishItems(1)
      return result
    },
    enabled: entries.length > 0,
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
