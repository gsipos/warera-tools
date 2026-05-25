import { itemRecipes } from '@/api/warera-item-recipes'
import { Badge } from '@/components/ui/badge'
import { moneyFormat, percentFormat } from '@/functions/number-formats'
import { useItemSellPrice } from '@/hooks/game/use-item-wage-report'
import { useTopWorkOfferWage } from '@/hooks/game/use-top-work-offer-wage'
import { DateTime } from 'luxon'
import { WarEra } from '@/api/types'
import { ItemImage } from '../atoms/ItemImage'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '../ui/item'
import { SimpleTooltip } from '../ui/tooltip'

export const Deposit = ({
  deposit,
  productionBonus,
  specialization,
}: {
  deposit: WarEra.Deposit | undefined
  productionBonus: number
  specialization: WarEra.ItemCode | undefined
}) => {
  const topWage = useTopWorkOfferWage()
  const depositItemProductionPoints = deposit ? itemRecipes[deposit.type ?? 'grain'].productionPoints : 0
  const sellPrice = useItemSellPrice(deposit?.type ?? 'grain')

  if (!deposit) {
    return null
  }

  const labourCost = topWage * (depositItemProductionPoints * (1 / (1 + productionBonus / 100)))
  const profit = sellPrice - labourCost

  const endsIn = DateTime.fromISO(deposit.endsAt)
    .diffNow()
    .shiftTo('days', 'hours')
    .toHuman({ unitDisplay: 'short', maximumFractionDigits: 0 })
  const bonus = deposit.bonusPercent + (specialization === deposit.type ? productionBonus : 0)

  return (
    <Item>
      <ItemMedia variant="image">
        <ItemImage itemCode={deposit.type} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="capitalize">
          {deposit.type}
          <span>+{percentFormat.format(bonus / 100)}</span>
        </ItemTitle>
        <ItemDescription>Ends in {endsIn}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <SimpleTooltip
          tooltip={
            <>
              <div>Wages: {moneyFormat.format(topWage)}</div>
              <div>Sell Price: {moneyFormat.format(sellPrice)}</div>
              <div>Labour Cost: {moneyFormat.format(labourCost)}</div>
              <div>Profit: {moneyFormat.format(profit)}</div>
            </>
          }
        >
          <Badge variant={profit > 0 ? 'secondary' : 'destructive'}>{moneyFormat.format(profit)}</Badge>
        </SimpleTooltip>
      </ItemActions>
    </Item>
  )
}
