import { percentFormat } from '@/functions/number-formats'
import { DateTime } from 'luxon'
import { WarEra } from '@/api/types'
import { ItemImage } from '../atoms/ItemImage'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '../ui/item'

export const Deposit = ({
  deposit,
  productionBonus,
  specialization,
}: {
  deposit: WarEra.Deposit | undefined
  productionBonus: number
  specialization: WarEra.ItemCode | undefined
}) => {
  if (!deposit) {
    return null
  }

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
    </Item>
  )
}
