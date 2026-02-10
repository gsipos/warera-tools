import { CountryFlag } from '@/components/molecules/CountryFlag'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SimpleTooltip } from '@/components/ui/tooltip'
import { countFormat, percentFormat } from '@/functions/number-formats'
import { cn } from '@/lib/utils'
import { FlameIcon, LandmarkIcon, Link2Icon, Link2OffIcon } from 'lucide-react'
import { WarEra } from 'warera-api'
import { Deposit } from '../molecules/Deposit'
import { ItemImage } from '../atoms/ItemImage'

interface Props {
  region: WarEra.Region
  country?: WarEra.Country | undefined
  initialCountry?: WarEra.Country | undefined
}

const Resistance = ({ resistance }: { resistance: number }) => {
  return (
    <SimpleTooltip tooltip="Resistance">
      <Badge variant="destructive">
        <FlameIcon /> {countFormat.format(resistance)}
      </Badge>
    </SimpleTooltip>
  )
}

export const RegionCard = ({ region, country, initialCountry }: Props) => {
  const initialCountryId = region.initialCountry
  const currentCountryId = region.country

  const currentCountry = country

  const isOccupied = initialCountryId !== currentCountryId

  const prodBonus = currentCountry?.rankings.countryProductionBonus.value || 0
  const specialization = currentCountry?.specializedItem

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
        <CardAction></CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Deposit deposit={region.deposit} productionBonus={prodBonus} specialization={specialization} />
      </CardContent>

      <CardFooter className="gap-2">
        {specialization ? (
          <SimpleTooltip tooltip={`Country specialization: ${specialization}`}>
            <Badge variant="secondary">
              <ItemImage itemCode={specialization} />
              {percentFormat.format(prodBonus / 100)}
            </Badge>
          </SimpleTooltip>
        ) : null}
        {isOccupied ? <Resistance resistance={region.resistance} /> : null}
        {region.isCapital ? (
          <SimpleTooltip tooltip="Capital">
            <Badge variant="default">
              <LandmarkIcon />
            </Badge>
          </SimpleTooltip>
        ) : null}
        {region.isLinkedToCapital ? null : (
          <SimpleTooltip tooltip={'Not linked to capital'}>
            <Badge variant="destructive">
              <Link2OffIcon />
            </Badge>
          </SimpleTooltip>
        )}
      </CardFooter>
    </Card>
  )
}
