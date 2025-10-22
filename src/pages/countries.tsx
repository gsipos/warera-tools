import { useCountries } from '@/api/warera-api'
import { createFileRoute } from '@tanstack/react-router'
import { useDeferredValue, useState } from 'react'
import { WarEra } from 'warera-api'
import { CountrySortButtonGroup, CountrySortValue } from './countries/-molecules/CountrySortBToggleGroup'
import { CountryCard } from './countries/-organisms/CountryCard'

export const Route = createFileRoute('/countries')({
  component: CountryListPage,
})

const sortValues: Record<CountrySortValue, (country: WarEra.Country) => number> = {
  money: (country) => country.money,
  population: (country) => country.rankings.countryActivePopulation.value,
  production: (country) => country.rankings.countryProductionBonus.value,
  development: (country) => country.rankings.countryDevelopment.value,
  weeklyDamage: (country) => country.rankings.weeklyCountryDamages.value,
  totalDamage: (country) => country.rankings.countryDamages.value,
  regionDiff: (country) => country.rankings.countryRegionDiff.value,
  wealth: (country) => country.rankings.countryWealth.value,
}

function CountryListPage() {
  const countryQuery = useCountries()
  const countries = countryQuery.data || []

  const [sortBy, setSortBy] = useState<CountrySortValue>('money')

  const sortedCountries = countries.toSorted((a, b) => {
    const sortFn = sortValues[sortBy]
    return sortFn(b) - sortFn(a)
  })
  const sortedCountriesDeferred = useDeferredValue(sortedCountries)

  return (
    <div className="grid grid-cols-4 gap-6 p-2">
      <div className="col-span-full flex">
        <CountrySortButtonGroup value={sortBy} onChange={setSortBy} />
      </div>
      {sortedCountriesDeferred.map((country, idx) => (
        <CountryCard country={country} key={country._id} idx={idx + 1} />
      ))}
    </div>
  )
}
