import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { ItemBackground } from '../atoms/ItemBackground'
import { ItemImage } from '../atoms/ItemImage'
import { DateTime } from 'luxon'
import { useTimeBoxedTransactions } from '@/hooks/game/use-time-boxed-transactions'
import { ItemThumbnail } from '../molecules/ItemThumbnail'
import { ScrollArea } from '../ui/scroll-area'
import { useItemMarketPrice } from '@/hooks/use-item-market-price'
import { WarEra } from '@/api/types'
import { TimeRangeSelect } from '../molecules/TimeRangeSelect'
import { Field, FieldLabel } from '../ui/field'
import { useDateRangeStore } from '@/stores/date-range-store'

const ItemThumbnailWithAvgMarketPrice = ({ item, pricingDate }: { item: WarEra.Item; pricingDate: DateTime }) => {
  const prices = useItemMarketPrice(item, pricingDate)

  return <ItemThumbnail item={item} money={prices?.avg ?? undefined} />
}

export const UserCraftingCard = ({ userId }: { userId: string }) => {
  const craftingTxs = useTimeBoxedTransactions({ userId, transactionType: 'craftItem' })
  const scrapsAmount = craftingTxs.reduce((acc, tx) => acc + tx.quantity, 0)

  const startOfToday = DateTime.now().startOf('day')
  const startOfYesterday = startOfToday.minus({ days: 1 })
  const craftedItems = craftingTxs.map((tx) => tx.item).toSorted()

  const craftedItemsToday = craftingTxs
    .filter((tx) => DateTime.fromISO(tx.createdAt) >= startOfToday)
    .map((tx) => tx.item)
    .toSorted()

  const craftedItemsYesterday = craftingTxs
    .filter((tx) => DateTime.fromISO(tx.createdAt) >= startOfYesterday)
    .map((tx) => tx.item)
    .filter((tx) => !craftedItemsToday.includes(tx))

  const craftedEarlierItems = craftedItems
    .filter((item) => !craftedItemsToday.includes(item))
    .filter((item) => !craftedItemsYesterday.includes(item))

  const dismantledTxs = useTimeBoxedTransactions({ userId, transactionType: 'dismantleItem' })
  const dismantledScraps = dismantledTxs.reduce((acc, tx) => acc + tx.quantity, 0)

  const lastTxTimeStamp = craftingTxs.at(-1)?.createdAt

  const pricingDate = useDateRangeStore((state) => state.startDate)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crafting</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>Since {DateTime.fromISO(lastTxTimeStamp ?? '').toLocaleString(DateTime.DATETIME_SHORT)}</div>
        <div>Items Crafted: {craftingTxs.length}</div>
        <div className="flex flex-row items-center gap-2">
          Scraps used:
          <ItemBackground level={3}>
            <ItemImage itemCode="scraps" className="size-8" />
          </ItemBackground>
          {scrapsAmount}
        </div>
        <div className="flex flex-row items-center gap-2">
          Items dismantled:
          <ItemBackground level={3}>
            <ItemImage itemCode="scraps" className="size-8" />
          </ItemBackground>
          {dismantledScraps}
        </div>
        <Field>
          <FieldLabel>Pricing range</FieldLabel>
          <TimeRangeSelect />
        </Field>

        {craftedItemsToday.length ? (
          <>
            <div className="text-muted-foreground mb-1 text-xs uppercase">
              Crafted today <span>({craftedItemsToday.length})</span>
            </div>
            <ScrollArea className="max-h-120">
              <div className="grid grid-cols-6 items-start gap-2">
                {craftedItemsToday.map((item) => (
                  <ItemThumbnailWithAvgMarketPrice key={item._id} item={item} pricingDate={pricingDate} />
                ))}
              </div>
            </ScrollArea>
          </>
        ) : null}

        {craftedItemsYesterday.length ? (
          <>
            <div className="text-muted-foreground mb-1 text-xs uppercase">
              Crafted yesterday <span>({craftedItemsYesterday.length})</span>
            </div>
            <ScrollArea className="max-h-120">
              <div className="grid grid-cols-6 items-start gap-2">
                {craftedItemsYesterday.map((item) => (
                  <ItemThumbnailWithAvgMarketPrice key={item._id} item={item} pricingDate={pricingDate} />
                ))}
              </div>
            </ScrollArea>
          </>
        ) : null}

        <div className="text-muted-foreground mb-1 text-xs uppercase">
          Crafted earlier <span>({craftedEarlierItems.length})</span>
        </div>
        <ScrollArea className="max-h-120">
          <div className="grid grid-cols-6 items-start gap-2">
            {craftedEarlierItems.map((item) => (
              <ItemThumbnail key={item._id} item={item} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  )
}
