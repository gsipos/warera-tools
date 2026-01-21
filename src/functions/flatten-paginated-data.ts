import { InfiniteData } from '@tanstack/query-core'
import { UseInfiniteQueryResult } from '@tanstack/react-query'
import { WarEra } from 'warera-api'

export const flattenPaginatedData = <T>(data: InfiniteData<WarEra.Paginated<T>>): T[] =>
  data.pages.flatMap((page) => page.items) ?? []

export const flattenPaginatedQuery = <T>(query: UseInfiniteQueryResult<InfiniteData<WarEra.Paginated<T>>>): T[] => {
  return query.data ? flattenPaginatedData(query.data) : []
}
