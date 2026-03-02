import { useRecommendedRegionsForCompany, useUserCompanies } from '@/api/warera-api'
import { percentFormat } from '@/functions/number-formats'
import { useRegionProdBonus } from '@/hooks/use-region-prod-bonus'
import { FactoryIcon, FlagIcon, PickaxeIcon } from 'lucide-react'
import { WarEra } from 'warera-api'
import { ItemImage } from '../atoms/ItemImage'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '../ui/item'

const CompanyItem = ({
  company,
  bonuses,
}: {
  company: WarEra.Company
  bonuses: ReturnType<typeof useRegionProdBonus>
}) => {
  const itemBonus = bonuses.get(company.itemCode) ?? []
  const regionBonus = itemBonus.find((b) => b.region._id === company.region)

  const topDepositRecommended = useRecommendedRegionsForCompany(company._id, true)
  const topCountryRecommended = useRecommendedRegionsForCompany(company._id, false)

  const currentRegionInRecommendations =
    topDepositRecommended.data?.find((r) => r.regionId === company.region) ??
    topCountryRecommended.data?.find((r) => r.regionId === company.region)

  const currentRegionBonus = currentRegionInRecommendations?.bonus ?? regionBonus?.bonus ?? 0

  const topDeposit = topDepositRecommended.data?.[0]?.bonus ?? 0
  const topCountry = topCountryRecommended.data?.[0]?.bonus ?? 0

  const isOptimal = currentRegionBonus >= topDeposit && currentRegionBonus >= topCountry
  const isDepositBetter = topDeposit > currentRegionBonus
  const isCountryBetter = topCountry > currentRegionBonus

  return (
    <Item size="sm">
      <ItemMedia variant="image">
        <ItemImage itemCode={company.itemCode} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{company.name}</ItemTitle>
        <ItemDescription className="flex flex-row justify-between">
          <Badge variant={isOptimal ? 'secondary' : 'destructive'}>
            <FactoryIcon className="inline" />
            {percentFormat.format(currentRegionBonus / 100)}
          </Badge>
          <Badge
            variant={isDepositBetter ? 'default' : 'outline'}
            className={isDepositBetter ? '' : 'text-muted-foreground'}
          >
            <PickaxeIcon className="inline" />
            {percentFormat.format((topDeposit ?? 0) / 100)}
          </Badge>
          <Badge
            variant={isCountryBetter ? 'default' : 'outline'}
            className={isCountryBetter ? '' : 'text-muted-foreground'}
          >
            <FlagIcon className="inline" />
            {percentFormat.format((topCountry ?? 0) / 100)}
          </Badge>
        </ItemDescription>
      </ItemContent>
    </Item>
  )
}

export const UserCompaniesCard = ({ userId }: { userId: string }) => {
  const bonuses = useRegionProdBonus()
  const companyQuery = useUserCompanies(userId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Companies</CardTitle>
        <CardDescription>Production bonuses (current - best deposit - best country)</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {companyQuery.data?.map((company) => (
          <CompanyItem key={company._id} company={company} bonuses={bonuses} />
        ))}
      </CardContent>
    </Card>
  )
}
