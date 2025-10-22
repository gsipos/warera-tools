import { useCountries, useRegionObject } from '@/api/warera-api'
import { WarEra } from 'warera-api'
import { useCompaniesByRegions } from './use-companies-by-regions'

export interface ExtendedRegion {
  region: WarEra.Region
  country: WarEra.Country | undefined
  initialCountry: WarEra.Country | undefined
  companies: WarEra.Company[]
}

export const useExtendedRegions = (): ExtendedRegion[] => {
  const regionQuery = useRegionObject()
  const countryQuery = useCountries()
  const companiesByRegions = useCompaniesByRegions()

  const regions = Object.values(regionQuery.data ?? {})
  const countries = countryQuery.data || []

  const extendedRegions = regions.map((region) => {
    const country = countries.find((c) => c._id === region.country)
    const initialCountry = countries.find((c) => c._id === region.initialCountry)
    const companies = companiesByRegions[region._id] || []

    return {
      region,
      country,
      initialCountry,
      companies,
    }
  })

  return extendedRegions
}
