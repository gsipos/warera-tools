import { useBatchedCompanies } from '@/api/warera-api'
import { useMemo } from 'react'
import { WarEra } from 'warera-api'

export const useCompaniesByUsers = (users: WarEra.UserLite[]) => {
  const companiesQuery = useBatchedCompanies()
  const companies = companiesQuery.data ?? []

  const userIds = useMemo(() => users.map((u) => u._id), [users])
  return useMemo(() => companies.filter((c) => userIds.includes(c.user)), [companies, userIds])
}
