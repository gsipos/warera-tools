import { useMemo } from 'react'
import { WarEra } from 'warera-api'
import {
  useAllPages,
  usePaginatedWarEraApiQuery,
  useWarEraApiBatchQuery,
  useWarEraApiQuery,
} from './warera-api-framework'

export const useCountries = () => useWarEraApiQuery<WarEra.Country[]>('country.getAllCountries')

export const useItemTradingPrices = () => useWarEraApiQuery<WarEra.ItemPrices>('itemTrading.getPrices')

export const useTradingTopOrders = (itemCode: WarEra.ItemCode, limit: number = 10) =>
  useWarEraApiQuery<WarEra.TradingTopOrder<typeof itemCode>>('tradingOrder.getTopOrders', { itemCode, limit })

export const useWorkOffers = (limit: number = 10) =>
  usePaginatedWarEraApiQuery<WarEra.WorkOffer>('workOffer.getWorkOffersPaginated', { limit })

export const useWorkOffersByCompanyId = (companyId: string) =>
  useWarEraApiQuery<WarEra.WorkOffer[]>('workOffer.getWorkOfferByCompanyId', { companyId })

export const useRegionObject = () => useWarEraApiQuery<WarEra.RegionObject>('region.getRegionsObject')

export const useUsersByCountry = (countryId: WarEra.CountryId, limit = 50) => {
  const query = usePaginatedWarEraApiQuery<
    WarEra.UserReference,
    {
      countryId: WarEra.CountryId
    }
  >('user.getUsersByCountry', {
    countryId,
    limit,
  })

  useAllPages(query)
  return query
}

export const useUserLite = (userId: string) => useWarEraApiQuery<WarEra.UserLite>('user.getUserLite', { userId })

export const useAllUsersLite = (userIds: string[]) => {
  return useWarEraApiBatchQuery<WarEra.UserLite>(
    userIds.map((userId) => ({ endpoint: 'user.getUserLite', input: { userId } })),
  )
}

export const useWorkOffersByCompanies = (companyIds: string[]) => {
  return useWarEraApiBatchQuery<WarEra.WorkOffer[]>(
    companyIds.map((c) => ({ endpoint: 'workOffer.getWorkOfferByCompanyId', input: { companyId: c } })),
  )
}

export const useTransactions = (options: WarEra.TransactionOptions) => {
  return usePaginatedWarEraApiQuery<WarEra.Transaction>('transaction.getPaginatedTransactions', options)
}

export const useCompany = (companyId: string) => useWarEraApiQuery<WarEra.Company>('company.getById', { companyId })

export const useCompanies = (companyIds: string[]) => {
  return useWarEraApiBatchQuery<WarEra.Company>(
    companyIds.map((c) => ({ endpoint: 'company.getById', input: { companyId: c } })),
  )
}

export const useCompanyIdsByUserId = (userId: string) =>
  usePaginatedWarEraApiQuery<string, { userId: string }>('company.getCompanies', { userId })

export const useUserCompanies = (userId: string) => {
  const companyIdsQuery = useCompanyIdsByUserId(userId)
  useAllPages(companyIdsQuery)
  const companyIds = useMemo(
    () => companyIdsQuery.data?.pages.flatMap((page) => page.items) || [],
    [companyIdsQuery.data],
  )
  const companies = useCompanies(companyIds)
  return companies
}
