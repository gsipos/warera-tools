import { WarEra } from '@/api/types'
import { z } from 'zod'

const countryTaxSchema = z.object({
  income: z.number(),
  market: z.number(),
  selfWork: z.number(),
})

const countryDevelopmentSchema = z.object({
  value: z.number(),
  rank: z.number(),
  tier: z.string(),
})

export const itemsSchema = z.enum([
  'cookedFish',
  'heavyAmmo',
  'steel',
  'bread',
  'grain',
  'limestone',
  'coca',
  'concrete',
  'oil',
  'case1',
  'lightAmmo',
  'steak',
  'livestock',
  'cocain',
  'lead',
  'fish',
  'petroleum',
  'ammo',
  'iron',
])

export const itemTradingPricesSchema = z.record(itemsSchema, z.number())

export const itemPricesCollectionSchema = z.object({
  item: itemsSchema,
  price: z.number(),
})

export const itemTradindPricesResponseSchema = z.object({
  result: z.object({
    data: itemTradingPricesSchema,
  }),
})

export const itemCodes: WarEra.ItemCode[] = [
  'cookedFish',
  'heavyAmmo',
  'steel',
  'bread',
  'grain',
  'limestone',
  'coca',
  'concrete',
  'oil',
  'case1',
  'lightAmmo',
  'steak',
  'livestock',
  'cocain',
  'lead',
  'fish',
  'petroleum',
  'ammo',
  'iron',
]

export const weaponsCodes = ['knife', 'gun', 'rifle', 'sniper', 'tank', 'jet'] as const satisfies WarEra.WeaponCode[]

export const armorLevels = [1, 2, 3, 4, 5, 6] as const satisfies WarEra.ArmorLevel[]
export const armorTypes = ['boots', 'pants', 'chest', 'helmet', 'gloves'] as const satisfies WarEra.ArmorType[]

export const armorCodes: WarEra.ArmorCode[] = armorTypes.flatMap((type) =>
  armorLevels.map<WarEra.ArmorCode>((level) => `${type}${level}`),
)

export const equipmentCodes = [...weaponsCodes, ...armorCodes] as const satisfies WarEra.EquipmentCode[]
