import { useWorkOffersByCompanies } from '@/api/warera-api'
import { useCompaniesByUsers } from '@/hooks/game/use-companies-by-users'
import { useCountryUsers } from '@/hooks/game/use-country-users'
import { useMemo } from 'react'
import { WarEra } from 'warera-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface WorkOfferDetails {
  workOffer: WarEra.WorkOffer
  company: WarEra.Company | undefined
  user: WarEra.UserLite | undefined
}

const WorkOfferCard = ({ workOffer }: { workOffer: WorkOfferDetails }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{workOffer.company?.name}</CardTitle>
      </CardHeader>
    </Card>
  )
}

interface Props {
  countryId: string
}

export const CountryWorkOffers = ({ countryId }: Props) => {
  const users = useCountryUsers(countryId).toReversed()

  const companies = useCompaniesByUsers(users)
  const companyIds = useMemo(() => companies.map((c) => c._id), [companies])
  const workOffers = useWorkOffersByCompanies(companyIds)

  const workOfferDetails = useMemo<WorkOfferDetails[]>(() => {
    return workOffers.map((wo) => {
      const company = companies.find((c) => c._id === wo.compnany)
      const user = users.find((u) => u._id === wo.user)
      return {
        workOffer: wo,
        company,
        user,
      }
    })
  }, [workOffers, companies, users])
  return (
    <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6 p-2">
      {workOfferDetails.map((wo) => (wo ? <WorkOfferCard workOffer={wo} /> : null))}
    </div>
  )
}
