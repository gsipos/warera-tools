import { LONG_QUERY_STALE_TIME, queryClient } from '@/functions/react-query-setup'
import { createCollection } from '@tanstack/db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQueries,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { WarEra } from 'warera-api'
import z from 'zod'
import { itemPricesCollectionSchema, itemsSchema, itemTradindPricesResponseSchema } from './warera-api-schema'
import { LoadingStateStore, useLoadingState } from '@/hooks/use-loading-state'
import pLimit from 'p-limit'

const warEraApiUrl = 'https://api2.warera.io/trpc/'

const getApiUrl = (endpoint: string, input?: Record<string, unknown>) => {
  const url = new URL(endpoint, warEraApiUrl)
  if (input) {
    url.searchParams.set('input', JSON.stringify(input))
  }

  return url.toString()
}

const warEraApiFetch = async <TData>(endPoint: string) => {
  useLoadingState.getState().addItems(1)
  const response = await fetch(endPoint)
  const data = (await response.json()) as WarEra.ApiResponse<TData>
  useLoadingState.getState().finishItems(1)
  return data.result.data
}

export const itemTradingPricesCollection = createCollection(
  queryCollectionOptions({
    queryKey: ['itemTradingPrices'],
    queryClient,
    getKey: (c) => c.item,
    schema: itemPricesCollectionSchema,
    queryFn: async () => {
      const response = await fetch(getApiUrl('itemTrading.getPrices'))
      const data = (await response.json()) as z.infer<typeof itemTradindPricesResponseSchema>
      const mappedData = Array.from(itemsSchema.values).map((item) => ({
        item,
        price: data.result.data[item],
      }))
      return mappedData
    },
  }),
)

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

export const useCountries = () => useWarEraApiQuery<WarEra.Country[]>('country.getAllCountries')
export const useItemTradingPrices = () => useWarEraApiQuery<WarEra.ItemPrices>('itemTrading.getPrices')

export const useTradingTopOrders = (itemCode: WarEra.ItemCode, limit: number = 10) =>
  useWarEraApiQuery<WarEra.TradingTopOrder<typeof itemCode>>('tradingOrder.getTopOrders', { itemCode, limit })

export const useWorkOffers = (limit: number = 10) =>
  useWarEraApiQuery<WarEra.Paginated<WarEra.WorkOffer>>('workOffer.getWorkOffersPaginated', { limit })

export const useWorkOffersByCompanyId = (companyId: string) =>
  useWarEraApiQuery<WarEra.WorkOffer[]>('workOffer.getWorkOfferByCompanyId', { companyId })

export const useRegionObject = () => useWarEraApiQuery<WarEra.RegionObject>('region.getRegionsObject')

const useAllPages = <T>(query: UseInfiniteQueryResult<InfiniteData<WarEra.Paginated<T>>>) => {
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

export const useCompanyIds = (limit: number = 100) => {
  const query = useInfiniteQuery<WarEra.Paginated<string>>({
    queryKey: ['companies', limit],
    staleTime: Infinity,
    queryFn: async ({ pageParam }) => {
      return warEraApiFetch<WarEra.Paginated<string>>(
        getApiUrl('company.getCompanies', {
          perPage: limit,
          cursor: pageParam,
        }),
      )
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  })

  useAllPages(query)

  console.log('useCompanyIds', query.data)

  return query
}

const companyResultCombiner = (results: UseQueryResult<unknown>[]) =>
  results.map<WarEra.Company[]>((r) => (r.data as WarEra.Company[]) ?? []).flat()

export const useAllCompanies = () => {
  const companiesQuery = useCompanyIds()
  const companyIds = useMemo(
    () => companiesQuery.data?.pages.flatMap((page) => page.items) || [],
    [companiesQuery.data],
  )

  const companies = useQueries<WarEra.Company[], WarEra.Company[]>({
    queries: companyIds.map((id) => ({
      queryKey: ['company', id],
      queryFn: async () => warEraApiFetch<WarEra.Company>(getApiUrl('company.getById', { companyId: id })),
    })),
    combine: companyResultCombiner,
  })

  console.log('useAllCompanies', companies)

  return companies ?? []
}

const fetchAllCompanies = async (limit = 100, loadingState: LoadingStateStore) => {
  const companyIds: string[] = []
  const companies: WarEra.Company[] = []
  let cursor: string | undefined = undefined

  let page: WarEra.Paginated<string> | undefined
  do {
    loadingState.addItems(1)
    page = await warEraApiFetch<WarEra.Paginated<string>>(
      getApiUrl('company.getCompanies', {
        perPage: limit,
        cursor,
      }),
    )

    companyIds.push(...page.items)
    cursor = page.nextCursor
    loadingState.finishItems(1)
  } while (cursor)

  loadingState.addItems(companyIds.length)

  const fetchLimit = pLimit(5)

  const fetches = companyIds.map(async (id) => {
    const company = await fetchLimit(() =>
      queryClient.ensureQueryData({
        queryKey: ['company', id],
        queryFn: async () => warEraApiFetch<WarEra.Company>(getApiUrl('company.getById', { companyId: id })),
        staleTime: LONG_QUERY_STALE_TIME,
      }),
    )
    companies.push(company)
    loadingState.finishItems(1)
  })
  await Promise.all(fetches)

  return companies
}

export const useBatchedCompanies = () => {
  const loadingState = useLoadingState()

  return useQuery<WarEra.Company[]>({
    queryKey: ['batchedCompanies'],
    queryFn: () => fetchAllCompanies(100, loadingState),
  })
}

export const useUsersByCountry = (countryId: WarEra.CountryId, limit = 10) => {
  const query = useInfiniteQuery<WarEra.Paginated<WarEra.UserReference>>({
    queryKey: ['usersByCountry', countryId, limit],
    queryFn: async ({ pageParam }) => {
      return warEraApiFetch<WarEra.Paginated<WarEra.UserReference>>(
        getApiUrl('user.getUsersByCountry', {
          countryId,
          limit,
          cursor: pageParam,
        }),
      )
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: !!countryId,
  })
  useAllPages(query)
  return query
}

export const useUserLite = (userId: string) => useWarEraApiQuery<WarEra.UserLite>('user.getUserLite', { userId })

export const useAllUsersLite = (userIds: string[]) => {
  const loadingState = useLoadingState()
  return useQueries<WarEra.UserLite[], { data: WarEra.UserLite[] }>({
    queries: userIds.map((userId) => ({
      queryKey: ['user.getUserLite', { userId }],
      queryFn: async () => warEraApiFetch<WarEra.UserLite>(getApiUrl('user.getUserLite', { userId })),
    })),
    combine: (results) => ({
      data: results.map((r) => r.data as WarEra.UserLite).filter((u) => !!u),
    }),
  })
}

export const useWorkOffersByCompanies = (companyIds: string[]) => {
  return useQueries<WarEra.WorkOffer[], WarEra.WorkOffer[]>({
    queries: companyIds.map((c) => ({
      queryKey: ['workOffer.getWorkOfferByCompanyId', c],
      enabled: !!c,
      queryFn: async () =>
        warEraApiFetch<WarEra.WorkOffer[]>(getApiUrl('workOffer.getWorkOfferByCompanyId', { companyId: c })),
    })),
    combine: (results) =>
      results
        .map((r) => (r.data as WarEra.WorkOffer[]) || [])
        .flat()
        .filter((o) => !!o),
  })
}

export const useTransactions = (options: WarEra.TransactionOptions) => {
  return useInfiniteQuery<WarEra.Paginated<WarEra.Transaction>>({
    queryKey: ['transactions', options],
    queryFn: async ({ pageParam }) => {
      return warEraApiFetch<WarEra.Paginated<WarEra.Transaction>>(
        getApiUrl('transaction.getPaginatedTransactions', {
          ...options,
          cursor: pageParam,
          limit: options.limit || 50,
        }),
      )
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  })
}
