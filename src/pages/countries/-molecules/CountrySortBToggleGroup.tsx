import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { SimpleTooltip } from '@/components/ui/tooltip'
import { BedIcon, CoinsIcon, FactoryIcon, MapIcon, PiggyBankIcon, SwordIcon, SwordsIcon, UsersIcon } from 'lucide-react'

export type CountrySortValue =
  | 'money'
  | 'population'
  | 'production'
  | 'development'
  | 'weeklyDamage'
  | 'totalDamage'
  | 'regionDiff'
  | 'wealth'

export const CountrySortButtonGroup = ({
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
          <SimpleTooltip tooltip="Treasury">
            <CoinsIcon />
          </SimpleTooltip>
        </ToggleGroupItem>
        <ToggleGroupItem value="population">
          <SimpleTooltip tooltip="Active Population">
            <UsersIcon />
          </SimpleTooltip>
        </ToggleGroupItem>
        <ToggleGroupItem value="production">
          <SimpleTooltip tooltip="Production Bonus">
            <FactoryIcon />
          </SimpleTooltip>
        </ToggleGroupItem>
        <ToggleGroupItem value="development">
          <SimpleTooltip tooltip="Development">
            <BedIcon />
          </SimpleTooltip>
        </ToggleGroupItem>
        <ToggleGroupItem value="weeklyDamage">
          <SimpleTooltip tooltip="Weekly Damage">
            <SwordIcon />
          </SimpleTooltip>
        </ToggleGroupItem>
        <ToggleGroupItem value="totalDamage">
          <SimpleTooltip tooltip="Total Damage">
            <SwordsIcon />
          </SimpleTooltip>
        </ToggleGroupItem>
        <ToggleGroupItem value="regionDiff">
          <SimpleTooltip tooltip="Region Difference">
            <MapIcon />
          </SimpleTooltip>
        </ToggleGroupItem>
        <ToggleGroupItem value="wealth">
          <SimpleTooltip tooltip="Wealth">
            <PiggyBankIcon />
          </SimpleTooltip>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
