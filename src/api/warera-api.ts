import { queryClient } from '@/functions/react-query-setup'
import { createCollection } from '@tanstack/db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { countriesResponseSchema, countrySchema } from './warera-api-schema'
import { useLiveQuery } from '@tanstack/react-db'
import z from 'zod'

const warEraApiUrl = 'https://api2.warera.io/trpc/'

const getApiUrl = (endpoint: string) => new URL(endpoint, warEraApiUrl).toString()

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

export const useAllCountries = () => useLiveQuery((q) => q.from({ countries: countryCollection }))
