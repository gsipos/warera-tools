import { useCountries } from '@/api/warera-api'
import { useMemo } from 'react'

export const useTopProdBonusCountry = () => {
  const countryQuery = useCountries()
  const countries = countryQuery.data || []

  return useMemo(() => {
    return countries.reduce((topCountry, country) => {
      if (country.rankings.countryProductionBonus.value > (topCountry?.rankings.countryProductionBonus.value ?? 0)) {
        return country
      }
      return topCountry
    }, countries[0])
  }, [countries])
}
