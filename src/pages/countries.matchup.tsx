import { useCountries } from '@/api/warera-api'
import { CountryCombobox } from '@/components/molecules/CountryCombobox'
import { CountryFlag } from '@/components/molecules/CountryFlag'
import { Separator } from '@/components/ui/separator'
import { countFormat, damageFormat, moneyFormat } from '@/functions/number-formats'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { WarEra } from 'warera-api'

export const Route = createFileRoute('/countries/matchup')({
  component: RouteComponent,
})

const toSum = (a: number, b: number) => a + b

const CountriesSummary = ({ countries }: { countries: WarEra.Country[] }) => {
  const totalWealth = countries.map((c) => c.rankings.countryWealth.value).reduce(toSum, 0)
  const totalMoney = countries.map((c) => c.money).reduce(toSum, 0)
  const totalPopulation = countries.map((c) => c.rankings.countryActivePopulation.value).reduce(toSum, 0)
  const totalRegionDiff = countries.map((c) => c.rankings.countryRegionDiff.value).reduce(toSum, 0)

  const weeklyDamages = countries.map((c) => c.rankings.weeklyCountryDamages.value).reduce(toSum, 0)
  const totalDamages = countries.map((c) => c.rankings.countryDamages.value).reduce(toSum, 0)

  return (
    <div className="flex flex-col gap-1">
      <div>Wealth: {moneyFormat.format(totalWealth)}</div>
      <div>Treasury: {moneyFormat.format(totalMoney)}</div>
      <div>Population: {countFormat.format(totalPopulation)}</div>
      <div>RegionDiff: {countFormat.format(totalRegionDiff)}</div>
      <div>Weekly Damage: {damageFormat.format(weeklyDamages)}</div>
      <div>Total Damage: {damageFormat.format(totalDamages)}</div>
    </div>
  )
}

const Matchup = () => {
  const countryQuery = useCountries()
  const countries = countryQuery.data || []

  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(undefined)

  const country = countries.find((c) => c._id === selectedCountry)
  const allies = countries.filter((c) => country?.allies.includes(c._id))
  const alliesOfAlliesIds = allies.map((a) => a.allies).flat()
  const alliesOfAllies = countries.filter((c) => alliesOfAlliesIds.includes(c._id))

  return (
    <div className="flex flex-col items-center gap-2 p-2">
      <CountryCombobox value={selectedCountry} onChange={setSelectedCountry} />
      <Separator className="my-4" />

      <div>
        {country ? (
          <div>
            <div className="flex flex-row gap-1">
              <CountryFlag code={country.code} /> {country.name}
            </div>
            <CountriesSummary countries={[country]} />

            <Separator className="my-4" />

            <div className="mb-2 font-bold">Allies</div>
            <CountriesSummary countries={allies} />
            <Separator className="my-4" />
            <div className="mb-2 font-bold">Allies of Allies</div>
            <CountriesSummary countries={alliesOfAllies} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function RouteComponent() {
  return (
    <div className="mx-auto grid grid-cols-3 gap-8">
      <div className="col-span-full">
        <h1 className="mb-4 text-2xl font-bold">Country Matchup</h1>
      </div>

      <Matchup />

      <Matchup />
    </div>
  )
}
