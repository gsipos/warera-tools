declare module 'warera-api' {
  namespace WarEra {
    type ItemCode =
      | 'cookedFish'
      | 'heavyAmmo'
      | 'steel'
      | 'bread'
      | 'grain'
      | 'limestone'
      | 'coca'
      | 'concrete'
      | 'oil'
      | 'case1'
      | 'lightAmmo'
      | 'steak'
      | 'livestock'
      | 'cocain'
      | 'lead'
      | 'fish'
      | 'petroleum'
      | 'ammo'
      | 'iron'

    interface ApiResponse<T> {
      result: {
        data: T
      }
    }

    interface Paginated<T> {
      items: T[]
      nextCursor?: string
    }

    type RankTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master'
    interface Rank {
      value: number
      rank: number
      tier: RankTier
    }

    type CountryId = string
    type IsoDateTime = string
    interface Country {
      _id: CountryId
      name: string
      code: string
      money: number
      orgs: string[]
      allies: CountryId[]
      warsWith: CountryId[]
      taxes: {
        income: number
        market: number
        selfWork: number
      }
      updatedAt: IsoDateTime
      rankings: {
        countryRegionDiff: Rank
        countryDamages: Rank
        weeklyCountryDamages: Rank
        countryDevelopment: Rank
        countryActivePopulation: Rank
        countryWealth: Rank
        countryProductionBonus: Rank
      }
    }

    type ItemPrices = Record<ItemCode, number>

    interface TradeOrder<Item extends ItemCode, Type extends 'buy' | 'sell'> {
      _id: string
      user: string
      itemCode: Item
      quantity: number
      price: number
      offerAt: IsoDateTime
      type: Type
      __v: number
    }

    interface TradingTopOrder<Item extends ItemCode> {
      buyOrders: TradeOrder<Item, 'buy'>[]
      sellOrders: TradeOrder<Item, 'sell'>[]
    }

    interface WorkOffer {
      _id: string
      compnany: string
      createdAt: IsoDateTime
      quantity: number
      region: string
      updatedAt: IsoDateTime
      user: string
      wage: number
      __v: number
    }

    interface ItemRecipe {
      productionPoints: number
      ingredient?: ItemCode
      ingredientQuantity?: number
    }

    interface Deposit {
      type: ItemCode
      quantity: number
      consumed: number
    }

    interface Region {
      stats: { investedMoney: number }
      dates: Record<string, unknown>
      _id: string
      code: string
      country: string
      initialCountry: string
      neighbors: string[]
      isCapital: boolean
      isLinkedToCapital: boolean
      upgradesV2: {
        upgrades: {
          base: {
            level: number
            constructionPoints: number
            investedMoney: number
            constructionStartedAt: IsoDateTime
            isUnderConstruction: IsoDateTime | null
            lastConstructions: unknown[]
            status: string
            constructionEndedAt: IsoDateTime
            statusChangedAt: IsoDateTime
          }
        }
        activeConstructionCount: number
      }
      name: string
      mainCity: string
      development: number
      baseDevelopment: number
      countryCode: string
      position: [number, number]
      biome: string
      climate: string
      __v: number
      resistance: number
      activeUpgradeLevels: unknown
      deposit: Deposit
    }

    type RegionObject = Record<string, Region>

    interface Company {
      _id: string
      user: string
      region: string
      itemCode: ItemCode
      isFull: boolean
      name: string
      concreteInvested: number
      production: number
      activeUpgradeLevels: {
        storage: number
        automatedEngine: number
        breakRoom: number
      }
      workers: string[]
      createdAt: IsoDateTime
      updatedAt: IsoDateTime
      __v: number
      movedUpAt: IsoDateTime
      estimatedValue: number
    }
  }
}
