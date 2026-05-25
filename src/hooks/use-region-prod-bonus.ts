import { WarEra } from '@/api/types'
import { useExtendedRegions } from './game/use-extended-region'

interface RegionProdBonus {
  item: WarEra.ItemCode
  type: 'deposit' | 'country'
  bonus: number
  region: WarEra.Region
  country: WarEra.Country | undefined
  initialCountry: WarEra.Country | undefined
}

export const useRegionProdBonus = () => {
  const regions = useExtendedRegions()

  const itemCodeSet = new Set<WarEra.ItemCode | undefined>()
  const bonuses: RegionProdBonus[] = regions
    .map((region) => {
      const country = region.country
      const baseProdBonus = country?.rankings.countryProductionBonus.value || 0
      const specialization = country?.specializedItem

      itemCodeSet.add(specialization)

      const result: RegionProdBonus[] = []

      const deposit = region.region.deposit
      if (deposit) {
        itemCodeSet.add(deposit.type)
        let depositBonus = deposit?.bonusPercent ?? 0
        if (deposit?.type === specialization) {
          depositBonus += baseProdBonus
        }
        result.push({
          item: deposit.type,
          type: 'deposit',
          bonus: depositBonus,
          region: region.region,
          country: country,
          initialCountry: region.initialCountry,
        })
      }
      if (specialization) {
        result.push({
          item: specialization,
          type: 'country',
          bonus: baseProdBonus,
          region: region.region,
          country: country,
          initialCountry: region.initialCountry,
        })
      }

      return result
    })
    .flat()

  const itemCodes = Array.from(itemCodeSet).filter((code): code is WarEra.ItemCode => code !== undefined)

  const bonusesByItemCode = new Map<WarEra.ItemCode, RegionProdBonus[]>()
  itemCodes.forEach((item) => {
    const affectedRegions = bonuses.filter((b) => b.item === item).toSorted((a, b) => b.bonus - a.bonus)
    bonusesByItemCode.set(item, affectedRegions)
  })

  return bonusesByItemCode
}
