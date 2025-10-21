import { useCountries } from '@/api/warera-api'
import { CountryFlag } from '@/components/molecules/CountryFlag'
import { Money } from '@/components/molecules/Money'
import { RankingBadge } from '@/components/molecules/RankingBadge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { createFileRoute } from '@tanstack/react-router'
import { BedIcon, CoinsIcon, FactoryIcon, MapIcon, SwordIcon, SwordsIcon, UsersIcon } from 'lucide-react'
import { useState } from 'react'
import { WarEra } from 'warera-api'

export const Route = createFileRoute('/countries/')({
  component: CountryListPage,
})

const CountryFlagList = (props: { cId: WarEra.CountryId[] }) => {
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

const CountryCard = (props: { country: WarEra.Country; idx: number }) => {
  return (
    <Card>
      <CardHeader>
        <CardDescription>#{props.idx}</CardDescription>
        <CardTitle className="flex flex-row items-center gap-1">
          <CountryFlag code={props.country.code} className="text-4xl" /> {props.country.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row gap-2">
          <div>Allies with:</div>
          <CountryFlagList cId={props.country.allies} />
        </div>
        <Separator />
        <div className="flex flex-row gap-2">
          <div>Wars with:</div>
          <CountryFlagList cId={props.country.warsWith} />
        </div>
      </CardContent>
      <CardFooter className="flex-wrap gap-2">
        <Money amount={props.country.money} />

        <RankingBadge icon={<UsersIcon />} rank={props.country.rankings.countryActivePopulation} type="count" />
        <RankingBadge icon={<FactoryIcon />} rank={props.country.rankings.countryProductionBonus} type="percent" />
        <RankingBadge icon={<BedIcon />} rank={props.country.rankings.countryDevelopment} type="count" />

        <RankingBadge icon={<SwordIcon />} rank={props.country.rankings.weeklyCountryDamages} type="damage" />
        <RankingBadge icon={<SwordsIcon />} rank={props.country.rankings.countryDamages} type="damage" />

        <RankingBadge icon={<MapIcon />} rank={props.country.rankings.countryRegionDiff} type="count" />
      </CardFooter>
    </Card>
  )
}

type CountrySortValue =
  | 'money'
  | 'population'
  | 'production'
  | 'development'
  | 'weeklyDamage'
  | 'totalDamage'
  | 'regionDiff'

const CountrySortButtonGroup = ({
  value,
  onChange,
}: {
  value: CountrySortValue
  onChange: (value: CountrySortValue) => void
}) => {
  return (
    <div className="flex flex-row items-center gap-1">
      <div className="text-muted-foreground">Sort by:</div>
      <ToggleGroup type="single" variant="outline" value={value} onValueChange={onChange}>
        <ToggleGroupItem value="money">
          <CoinsIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="population">
          <UsersIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="production">
          <FactoryIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="development">
          <BedIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="weeklyDamage">
          <SwordIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="totalDamage">
          <SwordsIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="regionDiff">
          <MapIcon />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}

const sortValues: Record<CountrySortValue, (country: WarEra.Country) => number> = {
  money: (country) => country.money,
  population: (country) => country.rankings.countryActivePopulation.value,
  production: (country) => country.rankings.countryProductionBonus.value,
  development: (country) => country.rankings.countryDevelopment.value,
  weeklyDamage: (country) => country.rankings.weeklyCountryDamages.value,
  totalDamage: (country) => country.rankings.countryDamages.value,
  regionDiff: (country) => country.rankings.countryRegionDiff.value,
}

function CountryListPage() {
  const countryQuery = useCountries()
  const countries = countryQuery.data || []

  const [sortBy, setSortBy] = useState<CountrySortValue>('money')

  const sortedCountries = countries.toSorted((a, b) => {
    const sortFn = sortValues[sortBy]
    return sortFn(b) - sortFn(a)
  })

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-full flex justify-end px-2">
        <CountrySortButtonGroup value={sortBy} onChange={setSortBy} />
      </div>
      {sortedCountries.map((country, idx) => (
        <CountryCard country={country} key={country._id} idx={idx + 1} />
      ))}
    </div>
  )
}
