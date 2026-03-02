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
      | 'scraps'

    interface ApiResponse<T> {
      result: {
        data: T
      }
    }

    type BatchedApiResponse<T> = ApiResponse<T>[]

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
      specializedItem: ItemCode
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
      endsAt: IsoDateTime
      startsAt: IsoDateTime
      bonusPercent: number
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

    interface UserSkill {
      level: number
      ammoPercent?: number
      buffsPercent?: number
      debuffsPercent?: number
      value: number
      weapon?: unknown
      equipment?: unknown
      total: number
      limited: unknown | null
    }

    interface UserAttackSkill extends UserSkill {
      militaryRankPercent: 15.75
    }

    interface UserBarSkill extends UserSkill {
      currentBarValue: number
      hourlyBarRegen: number
    }

    interface UserLite {
      _id: string
      createdAt: IsoDateTime
      username: string
      country: CountryId
      avatarUrl: string | null
      mu: string
      isActive: boolean
      militaryRank: number
      leveling: {
        level: number
        totalXp: number
        dailyXpLeft: number
        availableSkillPoints: number
        spentSkillPoints: number
        totalSkillPoints: number
        freeReset: number
      }
      skills: {
        energy: UserBarSkill
        health: UserBarSkill
        hunger: UserBarSkill
        attack: UserAttackSkill
        companies: UserSkill
        enterpreneurship: UserBarSkill
        production: UserBarSkill
        criticalChance: UserSkill
        criticalDamages: UserSkill
        armor: UserSkill
        precision: UserSkill
        dodge: UserSkill
        lootChance: UserSkill
        management: UserSkill
      }
      rankings: {
        userDamages: Rank
        weeklyUserDamages: Rank
        userWealth: Rank
        userLevel: Rank
        userReferrals: Rank
        userTerrans: Rank
        userCasesOpened: Rank
      }
      stats: {
        damagesCount: number
      }
      buffs?: {
        debuffCodes?: string[]
        debuffEndAt?: IsoDateTime
        buffCodes?: string[]
        buffEndAt?: IsoDateTime
      }
      dates: {
        lastSkillsResetAt: IsoDateTime
        lastConnectionAt: IsoDateTime
        lastCountryMessageCheckAt: IsoDateTime
        lastDailyRewardClaimedAt: IsoDateTime
        lastEventsCheckAt: IsoDateTime
        lastGlobalMessageCheckAt: IsoDateTime
        lastHelpAskedAt: IsoDateTime
        lastHiresAt: IsoDateTime[]
        lastNotificationsCheckAt: IsoDateTime
        lastWorkAt: IsoDateTime
        lastWorkOfferApplications: IsoDateTime[]
      }
    }

    type UserReference = Pick<UserLite, '_id' | 'createdAt'>
    type SkillKey = keyof UserLite['skills']

    type WeaponCode = 'knife' | 'gun' | 'rifle' | 'sniper' | 'tank' | 'jet'
    type ArmorLevel = 1 | 2 | 3 | 4 | 5 | 6
    type ArmorType = 'boots' | 'pants' | 'chest' | 'helmet' | 'gloves'
    type ArmorCode = `${ArmorType}${ArmorLevel}`
    type EquipmentCode = WeaponCode | ArmorCode

    interface Item {
      _id: string
      code: EquipmentCode
      skills: Record<string, number>
      state: number
      maxState: number
      quantity: number
      lasAquisitionAt: IsoDateTime
    }

    type TransactionType =
      | 'applicationFee'
      | 'trading'
      | 'itemMarket'
      | 'wage'
      | 'donation'
      | 'articleTip'
      | 'openCase'
      | 'craftItem'
      | 'dismantleItem'

    interface PageableOptions {
      limit?: number
      cursor?: string
    }

    interface TransactionOptions {
      limit?: number
      cursor?: string
      userId?: string
      muId?: string
      countryId?: string
      itemCode?: ItemCode | EquipmentCode
      transactionType?: TransactionType
    }

    interface Transaction {
      _id: string
      createdAt: IsoDateTime
      offerCreatedAt: IsoDateTime
      updatedAt: IsoDateTime

      buyerId: string
      sellerId: string
      itemCode: ItemCode
      quantity: number
      money: number
      transactionType: TransactionType
      __v: number

      item: Item
      itemCode?: ItemCode | EquipmentCode
    }

    interface RecommendedRegionForCompany {
      bonus: number
      depositBonus: number
      regionId: string
      strategicBonus: number
      taxPercent: number
      ethicDepositBonus: number
      ethicSpecializationBonus: number
    }
  }
}
