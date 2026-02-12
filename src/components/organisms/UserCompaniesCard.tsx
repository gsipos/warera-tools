import { useUserCompanies } from '@/api/warera-api'
import { useRegionProdBonus } from '@/hooks/use-region-prod-bonus'
import { useTransactions } from '@/api/warera-api'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Separator } from '../ui/separator'
import { ItemBackground } from '../atoms/ItemBackground'
import { ItemImage } from '../atoms/ItemImage'
import { DateTime } from 'luxon'
import { useTimeBoxedTransactions } from '@/hooks/game/use-time-boxed-transactions'
import { ItemThumbnail } from '../molecules/ItemThumbnail'
import { ScrollArea } from '../ui/scroll-area'
import { moneyFormat, percentFormat } from '@/functions/number-formats'
import { CircleDollarSignIcon, FactoryIcon, FlagIcon, PickaxeIcon } from 'lucide-react'
import { WarEra } from 'warera-api'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '../ui/item'
import { Badge } from '../ui/badge'
import { C } from 'node_modules/@tanstack/query-core/build/modern/hydration-CeGZtiZv'

const CompanyItem = ({
  company,
  bonuses,
}: {
  company: WarEra.Company
  bonuses: ReturnType<typeof useRegionProdBonus>
}) => {
  const itemBonus = bonuses.get(company.itemCode) ?? []
  const regionBonus = itemBonus.find((b) => b.region._id === company.region)

  const topDeposit = itemBonus.find((b) => b.type === 'deposit')
  const topCountry = itemBonus.find((b) => b.type === 'country')

  const isOptimal =
    (regionBonus?.bonus ?? 0) >= (topDeposit?.bonus ?? 0) && (regionBonus?.bonus ?? 0) >= (topCountry?.bonus ?? 0)
  const isDepositBetter = (topDeposit?.bonus ?? 0) > (regionBonus?.bonus ?? 0)
  const isCountryBetter = (topCountry?.bonus ?? 0) > (regionBonus?.bonus ?? 0)

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
            {percentFormat.format((regionBonus?.bonus ?? 0) / 100)}
          </Badge>
          <Badge
            variant={isDepositBetter ? 'default' : 'outline'}
            className={isDepositBetter ? '' : 'text-muted-foreground'}
          >
            <PickaxeIcon className="inline" />
            {percentFormat.format((topDeposit?.bonus ?? 0) / 100)}
          </Badge>
          <Badge
            variant={isCountryBetter ? 'default' : 'outline'}
            className={isCountryBetter ? '' : 'text-muted-foreground'}
          >
            <FlagIcon className="inline" />
            {percentFormat.format((topCountry?.bonus ?? 0) / 100)}
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
