import { useCountries } from '@/api/warera-api'
import { WarEra } from '@/api/types'

export const useCountry = (id: WarEra.CountryId) => {
  const countryQuery = useCountries()
  const allCountries = countryQuery.data || []

  const country = allCountries.find((country) => country._id === id)

  return country
}
