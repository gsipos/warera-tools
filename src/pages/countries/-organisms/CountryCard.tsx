import { CountryFlag } from '@/components/molecules/CountryFlag'
import { Money } from '@/components/molecules/Money'
import { RankingBadge } from '@/components/molecules/RankingBadge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { BedIcon, FactoryIcon, MapIcon, PiggyBankIcon, SwordIcon, SwordsIcon, UsersIcon } from 'lucide-react'
import { WarEra } from 'warera-api'
import { CountryFlagList } from './CountryFlagList'

export const CountryCard = (props: { country: WarEra.Country; idx: number }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-row items-center gap-1">
          <div className="text-muted-foreground mr-2">#{props.idx}</div>
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
        <RankingBadge
          icon={<PiggyBankIcon />}
          rank={props.country.rankings.countryWealth}
          type="money"
          tooltip="Wealth"
        />

        <Separator />

        <RankingBadge
          icon={<MapIcon />}
          rank={props.country.rankings.countryRegionDiff}
          type="count"
          tooltip="Region Difference"
        />
        <RankingBadge
          icon={<FactoryIcon />}
          rank={props.country.rankings.countryProductionBonus}
          type="percent"
          tooltip="Production Bonus"
        />
        <RankingBadge
          icon={<BedIcon />}
          rank={props.country.rankings.countryDevelopment}
          type="count"
          tooltip="Development"
        />

        <Separator />

        <RankingBadge
          icon={<UsersIcon />}
          rank={props.country.rankings.countryActivePopulation}
          type="count"
          tooltip="Active Population"
        />
        <RankingBadge
          icon={<SwordIcon />}
          rank={props.country.rankings.weeklyCountryDamages}
          type="damage"
          tooltip="Weekly Damage"
        />
        <RankingBadge
          icon={<SwordsIcon />}
          rank={props.country.rankings.countryDamages}
          type="damage"
          tooltip="Total Damage"
        />
      </CardFooter>
    </Card>
  )
}
