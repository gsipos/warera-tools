import { useCompanyProductionBonus, useUserCompanies } from '@/api/warera-api'
import { percentFormat } from '@/functions/number-formats'
import { FactoryIcon } from 'lucide-react'
import { WarEra } from '@/api/types'
import { ItemImage } from '../atoms/ItemImage'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '../ui/item'

const CompanyItem = ({ company }: { company: WarEra.Company }) => {
  const productionBonus = useCompanyProductionBonus(company._id).data

  return (
    <Item size="sm">
      <ItemMedia variant="image">
        <ItemImage itemCode={company.itemCode} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{company.name}</ItemTitle>
        <ItemDescription className="flex flex-row justify-between">
          {productionBonus && (
            <Badge variant={productionBonus.total > 0 ? 'default' : 'secondary'}>
              <FactoryIcon className="inline" />
              {percentFormat.format(productionBonus.total / 100)}
            </Badge>
          )}
        </ItemDescription>
      </ItemContent>
    </Item>
  )
}

export const UserCompaniesCard = ({ userId }: { userId: string }) => {
  const companyQuery = useUserCompanies(userId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Companies</CardTitle>
        <CardDescription>Production bonus per company</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {companyQuery.data?.map((company) => (
          <CompanyItem key={company._id} company={company} />
        ))}
      </CardContent>
    </Card>
  )
}
