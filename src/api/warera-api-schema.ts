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

export const countrySchema = z.object({
  _id: z.string(),
  name: z.string(),
  code: z.string(),
  money: z.number(),
  orgs: z.array(z.string()),
  allies: z.array(z.string()),
  warsWith: z.array(z.string()),
  taxes: countryTaxSchema,
  updatedAt: z.iso.datetime(),
  ranking: z.object({
    countryDevelopment: countryDevelopmentSchema,
  }),
})

export const countriesResponseSchema = z.object({
  result: z.object({
    data: z.array(countrySchema),
  }),
})

export const itemsSchema = z.literal([
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
