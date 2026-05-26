import { WarEra } from '@/api/types'

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

  case1: onlyProduction(1),
  scraps: onlyProduction(1),
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

interface CraftingRecipe {
  type: 'fixed' | 'random'
  level: WarEra.ArmorLevel
  scrap: number
  steel: number
}

export const craftingRecipes: CraftingRecipe[] = [
  { type: 'fixed', level: 1, scrap: 6, steel: 2 },
  { type: 'random', level: 1, scrap: 6, steel: 1 },

  { type: 'fixed', level: 2, scrap: 18, steel: 4 },
  { type: 'random', level: 2, scrap: 18, steel: 2 },

  { type: 'fixed', level: 3, scrap: 54, steel: 8 },
  { type: 'random', level: 3, scrap: 54, steel: 4 },

  { type: 'fixed', level: 4, scrap: 162, steel: 16 },
  { type: 'random', level: 4, scrap: 162, steel: 8 },

  { type: 'fixed', level: 5, scrap: 486, steel: 32 },
  { type: 'random', level: 5, scrap: 486, steel: 16 },

  { type: 'fixed', level: 6, scrap: 1458, steel: 64 },
  { type: 'random', level: 6, scrap: 1458, steel: 32 },
]
