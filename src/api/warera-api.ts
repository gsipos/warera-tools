import { WarEra } from '@/api/types'
import { apiClient } from './client'
import { useAsyncResource, useBatchAsyncResource } from '@/hooks/use-async-resource'
import { DateTime } from 'luxon'

// Type bridge: the tRPC client returns structurally compatible types that differ
// only in minor strictness (e.g. string vs string-literal unions). We cast through
// unknown to bridge until local WarEra types are removed in a future phase.
type Cast<T> = Promise<T>
const cast = <T>(p: Promise<unknown>): Cast<T> => p as Cast<T>

/**
 * Drain an async iterable of pages into a flat array.
 *
 * @param iter - The async iterable of paginated results.
 * @param maxPages - Maximum number of pages to fetch before stopping. Prevents
 *   unbounded pagination from draining memory or stalling the UI for large datasets.
 *   Defaults to 100. Pass `Infinity` to disable the limit (use with caution).
 */
async function collectPages<T>(
  iter: AsyncIterableIterator<{ items: T[]; cursor: string }>,
  maxPages: number = 100,
): Promise<T[]> {
  const result: T[] = []
  let pageCount = 0
  for await (const page of iter) {
    result.push(...page.items)
    pageCount++
    if (pageCount >= maxPages) {
      console.warn(
        `[collectPages] Reached maxPages limit (${maxPages}). ` +
          `Returning ${result.length} items collected so far. ` +
          `Increase maxPages if more results are needed.`,
      )
      break
    }
  }
  return result
}

// --- Non-paginated endpoints (tRPC client) ---

export const useCountries = () =>
  useAsyncResource(['country.getAllCountries'], () => cast<WarEra.Country[]>(apiClient.country.getAllCountries()))

export const useRegionObject = () =>
  useAsyncResource(['region.getRegionsObject'], () => cast<WarEra.RegionObject>(apiClient.region.getRegionsObject()))

export const useItemTradingPrices = () =>
  useAsyncResource(['itemTrading.getPrices'], () => cast<WarEra.ItemPrices>(apiClient.itemTrading.getPrices()))

export const useTradingTopOrders = (itemCode: WarEra.ItemCode, limit: number = 10) =>
  useAsyncResource(['tradingOrder.getTopOrders', { itemCode, limit }], () =>
    cast<WarEra.TradingTopOrder<typeof itemCode>>(apiClient.tradingOrder.getTopOrders({ itemCode, limit })),
  )

export const useUserLite = (userId: string) =>
  useAsyncResource(['user.getUserLite', { userId }], () =>
    cast<WarEra.UserLite>(apiClient.user.getUserLite({ userId })),
  )

export const useUserCurrentEquipment = (userId: string) =>
  useAsyncResource(['inventory.fetchCurrentEquipment', { userId }], () =>
    cast<WarEra.UserCurrentEquipment>(apiClient.inventory.fetchCurrentEquipment({ userId })),
  )

export const useCompany = (companyId: string) =>
  useAsyncResource(['company.getById', { companyId }], () =>
    cast<WarEra.Company>(apiClient.company.getById({ companyId })),
  )

export const useWorkOffersByCompanyId = (companyId: string) =>
  useAsyncResource(['workOffer.getWorkOfferByCompanyId', { companyId }], () =>
    cast<WarEra.WorkOffer[]>(apiClient.workOffer.getWorkOfferByCompanyId({ companyId })),
  )

// company.getRecommendedRegionIds is registered as a custom endpoint in client.ts.
export const useRecommendedRegionsForCompany = (companyId: string, includeDeposit: boolean) =>
  useAsyncResource(['company.getRecommendedRegionIds', { companyId, includeDeposit }], () =>
    apiClient.company.getRecommendedRegionIds({ companyId, includeDeposit }),
  )

// --- Batch endpoints (tRPC client with chunking) ---

export const useAllUsersLite = (userIds: string[]) =>
  useBatchAsyncResource(['user.getUserLite', 'batch'], userIds, (userId) =>
    cast<WarEra.UserLite>(apiClient.user.getUserLite({ userId })),
  )

export const useWorkOffersByCompanies = (companyIds: string[]) =>
  useBatchAsyncResource(['workOffer.getWorkOfferByCompanyId', 'batch'], companyIds, (companyId) =>
    cast<WarEra.WorkOffer[]>(apiClient.workOffer.getWorkOfferByCompanyId({ companyId })),
  )

export const useCompanies = (companyIds: string[]) =>
  useBatchAsyncResource(['company.getById', 'batch'], companyIds, (companyId) =>
    cast<WarEra.Company>(apiClient.company.getById({ companyId })),
  )

// --- Paginated endpoints (tRPC client with autoPaginate) ---

// Work offers can be a large dataset; cap at 50 pages to avoid memory pressure.
export const useWorkOffers = (limit: number = 10, maxPages: number = 50) =>
  useAsyncResource(
    ['workOffer.getWorkOffersPaginated', { limit, maxPages }],
    () =>
      collectPages(
        apiClient.workOffer.getWorkOffersPaginated({ limit, autoPaginate: true }),
        maxPages,
      ) as unknown as Cast<WarEra.WorkOffer[]>,
  )

// Users per country can be very large; cap at 20 pages (20 * limit items).
export const useUsersByCountry = (countryId: WarEra.CountryId, limit = 50, maxPages: number = 20) =>
  useAsyncResource(
    ['user.getUsersByCountry', { countryId, limit, maxPages }],
    () =>
      collectPages(apiClient.user.getUsersByCountry({ countryId, limit, autoPaginate: true }), maxPages) as Cast<
        WarEra.UserReference[]
      >,
  )

// A single user's companies is typically a small set; default limit is generous.
export const useCompanyIdsByUserId = (userId: string) =>
  useAsyncResource(
    ['company.getCompanies', { userId }],
    () => collectPages(apiClient.company.getCompanies({ userId, autoPaginate: true }), 100) as Cast<string[]>,
  )

// Transactions are naturally bounded by cursorEnd (date range), but we still
// apply a safeguard of 100 pages to prevent runaway pagination.
export const useTransactions = (options: WarEra.TransactionOptions & { from?: DateTime }) => {
  const { from, ...apiOptions } = options
  const cursorEnd = from?.toJSDate()
  return useAsyncResource(
    ['transaction.getPaginatedTransactions', { ...apiOptions, cursorEnd: cursorEnd?.toISOString() }],
    () =>
      collectPages(
        apiClient.transaction.getPaginatedTransactions({
          ...apiOptions,
          ...(cursorEnd ? { cursorEnd } : {}),
          autoPaginate: true,
        }),
        100,
      ) as unknown as Cast<WarEra.Transaction[]>,
  )
}

export const useUserCompanies = (userId: string) => {
  const companyIdsQuery = useCompanyIdsByUserId(userId)
  const companyIds = companyIdsQuery.data ?? []
  return useCompanies(companyIds)
}
