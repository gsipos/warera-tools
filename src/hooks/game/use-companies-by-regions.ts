import { useBatchedCompanies } from '@/api/warera-api'
import { useQuery } from '@tanstack/react-query'

export const useCompaniesByRegions = () => {
  const companiesQuery = useBatchedCompanies()
  const companies = companiesQuery.data ?? []

  const query = useQuery({
    queryKey: ['companiesByRegions', companies.map((c) => c._id)],
    queryFn: () => Object.groupBy(companies, (c) => c.region),
  })

  console.log('useCompaniesByRegions', query.data)

  return query.data ?? {}
}

export const useCompaniesInRegion = (regionId: string) => {
  const companiesByRegions = useCompaniesByRegions()
  return companiesByRegions[regionId] || []
}
