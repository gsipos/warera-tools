import { queryClient } from '@/functions/react-query-setup'
import { createCollection } from '@tanstack/db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { useLiveQuery } from '@tanstack/react-db'
import z from 'zod'
import {
  countriesResponseSchema,
  countrySchema,
  itemPricesCollectionSchema,
  itemsSchema,
  itemTradindPricesResponseSchema,
} from './warera-api-schema'
import { useQuery } from '@tanstack/react-query'
import { WarEra } from 'warera-api'

const warEraApiUrl = 'https://api2.warera.io/trpc/'

const getApiUrl = (endpoint: string, input?: Record<string, unknown>) => {
  const url = new URL(endpoint, warEraApiUrl)
  if (input) {
    url.searchParams.set('input', JSON.stringify(input))
  }

  return url.toString()
}

export const countryCollection = createCollection(
  queryCollectionOptions({
    queryKey: ['countries'],
    queryClient,
    getKey: (c) => c._id,
    schema: countrySchema,
    queryFn: async () => {
      const response = await fetch(getApiUrl('country.getAllCountries'))
      const data = (await response.json()) as z.infer<typeof countriesResponseSchema>
      return data.result.data
    },
  }),
)

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

export const useAllCountries = () => useLiveQuery((q) => q.from({ countries: countryCollection }))

export const useCountries = () => {
  return useQuery<WarEra.Country[]>({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await fetch(getApiUrl('country.getAllCountries'))
      const data = (await response.json()) as WarEra.ApiResponse<WarEra.Country[]>
      return data.result.data
    },
  })
}

export const useItemTradingPrices = () => {
  return useQuery<WarEra.ItemPrices>({
    queryKey: ['itemTradingPrices'],
    queryFn: async () => {
      const response = await fetch(getApiUrl('itemTrading.getPrices'))
      const data = (await response.json()) as WarEra.ApiResponse<WarEra.ItemPrices>
      return data.result.data
    },
  })
}

export const useTradingTopOrders = (itemCode: WarEra.ItemCode, limit: number = 10) => {
  return useQuery({
    queryKey: ['tradingTopOrders', itemCode, limit],
    queryFn: async () => {
      const response = await fetch(getApiUrl(`tradingOrder.getTopOrders`, { itemCode, limit }))
      const data = (await response.json()) as WarEra.ApiResponse<WarEra.TradingTopOrder<typeof itemCode>>
      return data.result.data
    },
  })
}

export const useWorkOffers = (limit: number = 10) => {
  return useQuery({
    queryKey: ['workOffers', limit],
    queryFn: async () => {
      const response = await fetch(getApiUrl(`workOffer.getWorkOffersPaginated`, { limit }))
      const data = (await response.json()) as WarEra.ApiResponse<WarEra.Paginated<WarEra.WorkOffer>>
      return data.result.data.items
    },
  })
}
