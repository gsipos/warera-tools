import { useTransactions } from '@/api/warera-api'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Separator } from '../ui/separator'
import { ItemBackground } from '../atoms/ItemBackground'
import { ItemImage } from '../atoms/ItemImage'
import { DateTime } from 'luxon'

export const UserItemMarketCard = ({ userId }: { userId: string }) => {
  const itemMarketQuery = useTransactions({
    userId: userId,
    transactionType: 'itemMarket',
  })
  const tsx = itemMarketQuery.data?.pages.flatMap((p) => p.items) ?? []

  const soldItems = tsx.filter((tx) => tx.sellerId === userId)
  const boughtItems = tsx.filter((tx) => tx.buyerId === userId)

  const soldValue = soldItems.reduce((acc, tx) => acc + tx.money, 0)
  const boughtValue = boughtItems.reduce((acc, tx) => acc + tx.money, 0)

  const lastTxTimeStamp = tsx.at(-1)?.createdAt

  return (
    <Card>
      <CardHeader>
        <CardTitle>Item Market</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>Since {DateTime.fromISO(lastTxTimeStamp ?? '').toLocaleString(DateTime.DATETIME_SHORT)}</div>
        <div>
          Items Sold: {soldItems.length} for {soldValue.toLocaleString()}{' '}
        </div>
        <div>
          Items Bought: {boughtItems.length} for {boughtValue.toLocaleString()}{' '}
        </div>

        <Separator />
        <div>Sold Items</div>
        <div className="grid grid-cols-6 gap-2">
          {soldItems.map((tx, idx) => (
            <ItemBackground key={idx} code={tx.item.code}>
              <ItemImage itemCode={tx.item.code} className="size-6" />
            </ItemBackground>
          ))}
        </div>
        <Separator />
        <div>Bought Items</div>
        <div className="grid grid-cols-6 gap-2">
          {boughtItems.map((tx, idx) => (
            <ItemBackground key={idx} code={tx.item.code}>
              <ItemImage itemCode={tx.item.code} className="size-6" />
            </ItemBackground>
          ))}
        </div>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  )
}
