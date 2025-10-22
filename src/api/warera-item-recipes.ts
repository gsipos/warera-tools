import { WarEra } from 'warera-api'

const onlyProduction = (pp: number): WarEra.ItemRecipe => ({ productionPoints: pp ?? 1 })

const withIngredients = (pp: number, ingredient: WarEra.ItemCode, qty: number): WarEra.ItemRecipe => ({
  productionPoints: pp ?? 1,
  ingredient,
  ingredientQuantity: qty,
})

export const itemRecipes: Record<WarEra.ItemCode, WarEra.ItemRecipe> = {
  grain: onlyProduction(1),
  limestone: onlyProduction(1),
  lead: onlyProduction(1),
  petroleum: onlyProduction(1),
  iron: onlyProduction(1),
  coca: onlyProduction(1),
  livestock: onlyProduction(20),
  fish: onlyProduction(40),

  steel: withIngredients(10, 'iron', 10),
  concrete: withIngredients(10, 'limestone', 10),
  oil: withIngredients(1, 'petroleum', 1),
  bread: withIngredients(10, 'grain', 10),
  steak: withIngredients(20, 'livestock', 1),
  cookedFish: withIngredients(40, 'fish', 1),
  ammo: withIngredients(1, 'lead', 1),
  lightAmmo: withIngredients(4, 'lead', 4),
  heavyAmmo: withIngredients(16, 'lead', 16),
  cocain: withIngredients(200, 'coca', 200),

  case1: onlyProduction(1), // TODO: remove this
}

export const depositItemCodes: WarEra.ItemCode[] = [
  'grain',
  'limestone',
  'lead',
  'petroleum',
  'iron',
  'coca',
  'livestock',
  'fish',
]
