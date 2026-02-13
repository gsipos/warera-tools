import { itemCodes } from '@/api/warera-api-schema'
import { ItemImage } from '@/components/atoms/ItemImage'
import { CountryFlag } from '@/components/molecules/CountryFlag'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Item, ItemContent, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { percentFormat } from '@/functions/number-formats'
import { useRegionProdBonus } from '@/hooks/use-region-prod-bonus'
import { createFileRoute } from '@tanstack/react-router'
import { WarEra } from 'warera-api'

export const Route = createFileRoute('/item/production')({
  component: RouteComponent,
})

const ItemBonusCard = ({
  itemCode,
  allBonuses,
}: {
  itemCode: WarEra.ItemCode
  allBonuses: ReturnType<typeof useRegionProdBonus>
}) => {
  const bonuses = allBonuses.get(itemCode) ?? []

  const topDeposit = bonuses.filter((b) => b.type === 'deposit')
  const topCountry = bonuses.filter((b) => b.type === 'country')

  const countryCount = new Set(topCountry.map((b) => b.country?._id)).size
  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">
          <ItemImage itemCode={itemCode} className="mr-2 inline" />
          {itemCode}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topDeposit.length ? (
          <>
            <div className="text-muted-foreground mb-1 text-xs uppercase">Deposits ({topDeposit.length})</div>
            <ScrollArea className="h-48">
              <ItemGroup>
                {topDeposit.map((b) => (
                  <Item key={b.region._id} size="sm">
                    <ItemMedia variant="icon">
                      <span>{percentFormat.format(b.bonus / 100)}</span>
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>
                        {b.country ? <CountryFlag code={b.country.code} /> : null}
                        {b.region.name}
                      </ItemTitle>
                    </ItemContent>
                  </Item>
                ))}
              </ItemGroup>
            </ScrollArea>
            <Separator className="my-2" />
          </>
        ) : null}
        <div className="text-muted-foreground mb-1 text-xs uppercase">Country Bonus ({countryCount})</div>
        <ScrollArea className={topDeposit.length ? 'h-48' : 'h-96'}>
          <ItemGroup>
            {topCountry.map((b) => (
              <Item key={b.region._id} size="sm">
                <ItemMedia variant="icon">
                  <span>{percentFormat.format(b.bonus / 100)}</span>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    {b.country ? <CountryFlag code={b.country.code} /> : null}
                    {b.region.name}
                  </ItemTitle>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function RouteComponent() {
  const bonuses = useRegionProdBonus()
  return (
    <div>
      <div className="mb-2 px-2">
        <h1 className="text-2xl font-bold">Item Production Bonuses</h1>
        <div className="text-muted-foreground text-sm">Doesn't contain party ethics bonuses!</div>
      </div>
      <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 p-2">
        {itemCodes.map((ic) => (
          <ItemBonusCard key={ic} itemCode={ic} allBonuses={bonuses} />
        ))}
      </div>
    </div>
  )
}
