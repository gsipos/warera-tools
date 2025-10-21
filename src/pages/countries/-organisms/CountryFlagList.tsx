import { useCountries } from '@/api/warera-api'
import { CountryFlag } from '@/components/molecules/CountryFlag'
import { WarEra } from 'warera-api'

export const CountryFlagList = (props: { cId: WarEra.CountryId[] }) => {
  const countryQuery = useCountries()
  const allCountries = countryQuery.data || []

  const countries = props.cId.map((id) => allCountries.find((c) => c._id === id)).filter((c) => !!c)

  return (
    <div className="flex flex-row flex-wrap gap-1">
      {countries.map((country) => (
        <CountryFlag key={country!._id} code={country!.code} className="inline-block text-sm" />
      ))}
    </div>
  )
}
