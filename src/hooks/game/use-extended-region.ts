import { useCountries, useRegionObject } from '@/api/warera-api'
import { WarEra } from 'warera-api'

export interface ExtendedRegion {
  region: WarEra.Region
  country: WarEra.Country | undefined
  initialCountry: WarEra.Country | undefined
}

export const useExtendedRegions = (): ExtendedRegion[] => {
  const regionQuery = useRegionObject()
  const countryQuery = useCountries()

  const regions = Object.values(regionQuery.data ?? {})
  const countries = countryQuery.data || []

  const extendedRegions = regions.map((region) => {
    const country = countries.find((c) => c._id === region.country)
    const initialCountry = countries.find((c) => c._id === region.initialCountry)

    return {
      region,
      country,
      initialCountry,
    }
  })

  return extendedRegions
}
