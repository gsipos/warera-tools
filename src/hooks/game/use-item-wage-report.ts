import { WarEra } from 'warera-api'
import { useTopWorkOfferWage } from './use-top-work-offer-wage'
import { itemRecipes } from '@/api/warera-item-recipes'
import { useTradingTopOrders } from '@/api/warera-api'

const useItemSellPrice = (item: WarEra.ItemCode) => {
  const topOrdersQuery = useTradingTopOrders(item)
  const sellOrders = topOrdersQuery.data?.sellOrders || []
  return sellOrders[0]?.price || 0
}

export const useItemWageReport = (item: WarEra.ItemCode, countryProductionBonus: number = 0) => {
  //const wage = useTopWorkOfferWage()
  //const sellPrice = useItemSellPrice(item)
  //const recipe = itemRecipes[item]

  //const baseWage = recipe.productionPoints * (wage * (1 - countryProductionBonus))

  return 0
}
