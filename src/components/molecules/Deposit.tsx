import { itemRecipes } from '@/api/warera-item-recipes'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { countFormat, moneyFormat, percentFormat } from '@/functions/number-formats'
import { useItemSellPrice } from '@/hooks/game/use-item-wage-report'
import { useTopWorkOfferWage } from '@/hooks/game/use-top-work-offer-wage'
import { FactoryIcon, PickaxeIcon } from 'lucide-react'
import { WarEra } from 'warera-api'

export const Deposit = ({
  deposit,
  productionBonus,
  companies,
}: {
  deposit: WarEra.Deposit | undefined
  productionBonus: number
  companies: WarEra.Company[]
}) => {
  const topWage = useTopWorkOfferWage()
  const depositItemProductionPoints = deposit ? itemRecipes[deposit.type ?? 'grain'].productionPoints : 0
  const sellPrice = useItemSellPrice(deposit?.type ?? 'grain')

  if (!deposit) {
    return null
  }

  const labourCost = topWage * (depositItemProductionPoints * (1 - productionBonus / 100))
  const profit = sellPrice - labourCost

  const all = deposit.quantity + deposit.consumed
  const value = (deposit.quantity / all) * 100

  const bonus = productionBonus + 30

  const companiesMiningDeposits = companies.filter((c) => c.itemCode === deposit.type)
  const miningSumValue = companiesMiningDeposits.reduce((sum, c) => sum + c.estimatedValue, 0)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-row items-center justify-between gap-1">
        <PickaxeIcon />
        {deposit.type}
        <Badge>
          <FactoryIcon /> +{percentFormat.format(bonus / 100)}
        </Badge>
      </div>
      <div>
        <Progress value={value} className="w-full" />
      </div>
      <div className="text-muted-foreground text-sm">
        ({countFormat.format(deposit.quantity)} / {countFormat.format(all)}) - ({percentFormat.format(value / 100)})
      </div>
      <div>
        Comanies mining this deposit: {companiesMiningDeposits.length} (Estimated Value:{' '}
        {countFormat.format(miningSumValue)})
      </div>
      <div>
        <div>Wages: {moneyFormat.format(topWage)}</div>
        <div>Sell Price: {moneyFormat.format(sellPrice)}</div>
        <div>Labour Cost: {moneyFormat.format(labourCost)}</div>
        <div>
          Profit:
          <Badge variant={profit > 0 ? 'secondary' : 'destructive'}>{moneyFormat.format(profit)}</Badge>
        </div>
      </div>
    </div>
  )
}
