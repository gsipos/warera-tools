import { useItemTradingPrices, useTradingTopOrders } from '@/api/warera-api'
import { itemRecipes } from '@/api/warera-item-recipes'
import { WarEra } from 'warera-api'
import { Separator } from '../ui/separator'

interface Props {
  itemCode: WarEra.ItemCode
  topProdBonusCountry: WarEra.Country
  topWage: number
}

export const ItemMarketDetails = (props: Props) => {
  const { itemCode, topProdBonusCountry, topWage } = props

  const selllingPrice = useItemTradingPrices().data?.[itemCode] || 0
  const topOrders = useTradingTopOrders(itemCode)

  const recipe = itemRecipes[itemCode]
  const productionPoints = recipe.productionPoints ?? 1

  const ingredientCode = recipe.ingredient
  const ingredientQuantity = recipe.ingredientQuantity ?? 1

  return (
    <div className="flex flex-col gap-2">
      <div>{itemCode}</div>

      <div>Production Points: {productionPoints}</div>
      {ingredientCode ? (
        <div>
          Ingredient: {ingredientQuantity} x {ingredientCode}
        </div>
      ) : null}

      <Separator />
    </div>
  )
}
