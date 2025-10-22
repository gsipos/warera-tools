import { CountryFlag } from '@/components/molecules/CountryFlag'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SimpleTooltip } from '@/components/ui/tooltip'
import { countFormat } from '@/functions/number-formats'
import { cn } from '@/lib/utils'
import { Building2Icon, FlameIcon, LandmarkIcon, Link2Icon, Link2OffIcon } from 'lucide-react'
import { WarEra } from 'warera-api'
import { Deposit } from '../molecules/Deposit'

interface Props {
  region: WarEra.Region
  companies: WarEra.Company[]
  country?: WarEra.Country | undefined
  initialCountry?: WarEra.Country | undefined
}

const Resistance = ({ resistance }: { resistance: number }) => {
  return (
    <div className="text-destructive-foreground bg-destructive/20 flex w-fit flex-row items-center gap-1 rounded-md px-2">
      <FlameIcon /> Resistance {countFormat.format(resistance)}
      <Progress value={(resistance / 40) * 100} className="w-32" />
    </div>
  )
}

export const RegionCard = ({ region, companies, country, initialCountry }: Props) => {
  const initialCountryId = region.initialCountry
  const currentCountryId = region.country

  const currentCountry = country

  const isOccupied = initialCountryId !== currentCountryId

  const prodBonus = currentCountry?.rankings.countryProductionBonus.value || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-row items-center gap-1">
          {currentCountry && initialCountryId !== currentCountryId ? (
            <CountryFlag code={currentCountry?.code} className="text-2xl" />
          ) : null}
          {initialCountry ? (
            <CountryFlag code={initialCountry?.code} className={cn(isOccupied ? 'text-sm opacity-70' : 'text-2xl')} />
          ) : null}

          {region.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Deposit deposit={region.deposit} productionBonus={prodBonus} companies={companies} />

        {isOccupied ? <Resistance resistance={region.resistance} /> : null}
      </CardContent>

      <CardFooter>
        {region.isCapital ? (
          <Badge variant="default">
            <LandmarkIcon />
            Capital
          </Badge>
        ) : null}
        <Badge variant="outline">{region.biome}</Badge>
        <Badge variant="outline">{region.climate}</Badge>
        <SimpleTooltip tooltip={region.isLinkedToCapital ? 'Linked to capital' : 'Not linked to capital'}>
          <Badge variant={region.isLinkedToCapital ? 'outline' : 'destructive'}>
            {region.isLinkedToCapital ? <Link2Icon /> : <Link2OffIcon />}
          </Badge>
        </SimpleTooltip>
        <SimpleTooltip tooltip={`${companies.length} companies in this region`}>
          <Badge variant="outline">
            <Building2Icon />
            {companies.length}
          </Badge>
        </SimpleTooltip>
      </CardFooter>
    </Card>
  )
}
