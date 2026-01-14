import { useTransactions } from '@/api/warera-api'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { ItemBackground } from '../atoms/ItemBackground'
import { ItemImage } from '../atoms/ItemImage'
import { DateTime } from 'luxon'

export const UserCraftingCard = ({ userId }: { userId: string }) => {
  const craftingTxQuery = useTransactions({
    userId: userId,
    transactionType: 'craftItem',
  })
  const craftingTxs = craftingTxQuery.data?.pages.flatMap((p) => p.items) ?? []
  const scrapsAmount = craftingTxs.reduce((acc, tx) => acc + tx.quantity, 0)
  const craftedItems = craftingTxs.map((tx) => tx.item.code).toSorted()

  const dismantledItems = useTransactions({
    userId: userId,
    transactionType: 'dismantleItem',
  })
  const dismantledTxs = dismantledItems.data?.pages.flatMap((p) => p.items) ?? []
  const dismantledScraps = dismantledTxs.reduce((acc, tx) => acc + tx.quantity, 0)

  const lastTxTimeStamp = craftingTxs.at(-1)?.createdAt

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

        <div>Crafted Items:</div>
        <div className="grid grid-cols-6 gap-2">
          {craftedItems.map((code, idx) => (
            <ItemBackground key={idx} code={code}>
              <ItemImage itemCode={code} className="size-6" />
            </ItemBackground>
          ))}
        </div>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  )
}
