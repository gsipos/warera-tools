import type {
  CountryListItem,
  RegionsObjectItem,
  RegionDeposit,
  RankingValueTier,
  UserGetUserLiteResponse,
  UsersByCountryItem,
  UserSkills,
  CompanyGetByIdResponse,
  WorkOfferListItem,
  TransactionListItem,
  TradingOrderGetTopOrdersResponse,
  ItemTradingGetPricesResponse,
  InventoryFetchCurrentEquipmentResponse,
  RoundEquipment,
  TransactionItem,
} from '@wareraprojects/api'

// Re-export raw API types for direct use
export type {
  CountryListItem,
  RegionsObjectItem,
  RegionDeposit,
  RankingValueTier,
  UserGetUserLiteResponse,
  UsersByCountryItem,
  UserSkills,
  CompanyGetByIdResponse,
  WorkOfferListItem,
  TransactionListItem,
  TradingOrderGetTopOrdersResponse,
  ItemTradingGetPricesResponse,
  InventoryFetchCurrentEquipmentResponse,
  RoundEquipment,
  TransactionItem,
} from '@wareraprojects/api'

/**
 * Type facade providing backward-compatible WarEra namespace types.
 * Maps old 'warera-api' module types to @wareraprojects/api equivalents.
 * This provides a clean migration path from the legacy ambient module declaration.
 *
 * Note: The API package uses `string` for many fields that are logically constrained
 * to specific literal unions (e.g., itemCode, tier). This facade preserves the strict
 * local types for UI code, and consumers should cast at boundaries where needed.
 */
export namespace WarEra {
  // --- String literal types (not available in API package) ---

  export type ItemCode =
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

  export type WeaponCode = 'knife' | 'gun' | 'rifle' | 'sniper' | 'tank' | 'jet'

  export type ArmorLevel = 1 | 2 | 3 | 4 | 5 | 6

  export type ArmorType = 'boots' | 'pants' | 'chest' | 'helmet' | 'gloves'

  export type ArmorCode = `${ArmorType}${ArmorLevel}`

  export type EquipmentCode = WeaponCode | ArmorCode

  export type TransactionType =
    | 'applicationFee'
    | 'trading'
    | 'itemMarket'
    | 'wage'
    | 'donation'
    | 'articleTip'
    | 'openCase'
    | 'craftItem'
    | 'dismantleItem'

  export type RankTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master'

  export type CountryId = string

  export type IsoDateTime = string

  // --- Mapped types from @wareraprojects/api ---

  export type Country = Omit<CountryListItem, 'specializedItem'> & {
    specializedItem?: ItemCode
  }

  export type Region = Omit<RegionsObjectItem, 'deposit'> & {
    deposit?: Deposit
  }

  export type RegionObject = Record<string, Region>

  /** Region deposit with typed item code. */
  export type Deposit = Omit<RegionDeposit, 'type'> & {
    type: ItemCode
  }

  export type Rank = RankingValueTier

  /** UserLite extended with optional buffs field present in some API responses. */
  export type UserLite = UserGetUserLiteResponse & {
    buffs?: {
      debuffCodes?: string[]
      debuffEndAt?: string
      buffCodes?: string[]
      buffEndAt?: string
    }
  }

  export type UserReference = UsersByCountryItem

  export type SkillKey = keyof UserSkills

  export type Company = Omit<CompanyGetByIdResponse, 'itemCode'> & {
    itemCode: ItemCode
  }

  export type WorkOffer = WorkOfferListItem

  export type Transaction = Omit<TransactionListItem, 'itemCode' | 'item' | 'money' | 'quantity'> & {
    itemCode: ItemCode | EquipmentCode
    item: Item
    money: number
    quantity: number
  }

  export type TradingTopOrder<_T extends ItemCode = ItemCode> = TradingOrderGetTopOrdersResponse

  export type ItemPrices = ItemTradingGetPricesResponse

  /** Equipment from inventory endpoint. Includes optional ammoQuantity from current equipment responses. */
  export type UserCurrentEquipment = InventoryFetchCurrentEquipmentResponse & {
    ammoQuantity?: number | null
  }

  /** An equipment item. Common shape across RoundEquipment and TransactionItem. */
  export interface Item {
    _id: string
    code: string
    skills: Record<string, number>
    state: number
    maxState: number
    quantity: number
    lastAcquisitionAt?: string
    type?: string
  }

  // --- Types kept locally (not in API package) ---

  export interface ItemRecipe {
    productionPoints: number
    ingredient?: ItemCode
    ingredientQuantity?: number
  }

  export interface TransactionOptions {
    limit?: number
    cursor?: string
    userId?: string
    muId?: string
    countryId?: string
    itemCode?: ItemCode | EquipmentCode
    transactionType?: TransactionType
  }

  export interface RecommendedRegionForCompany {
    bonus: number
    depositBonus: number
    regionId: string
    strategicBonus: number
    taxPercent: number
    ethicDepositBonus: number
    ethicSpecializationBonus: number
  }
}
