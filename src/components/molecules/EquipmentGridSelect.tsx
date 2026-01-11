import { armorCodes, armorLevels, armorTypes, weaponsCodes } from '@/api/warera-api-schema'
import { cn } from '@/lib/utils'
import { WarEra } from 'warera-api'
import { Button } from '../ui/button'
import { Fragment } from 'react/jsx-runtime'
import { ItemImage } from '../atoms/ItemImage'
import { Item } from '@radix-ui/react-navigation-menu'
import { ItemBackground } from '../atoms/ItemBackground'

interface Props {
  className?: string
  value?: WarEra.EquipmentCode
  onChange?: (value: WarEra.EquipmentCode) => void
}

export const EquipmentGridSelect = (props: Props) => {
  return (
    <div className={cn('grid grid-cols-7 gap-2', props.className)}>
      <div>Weapons</div>
      {weaponsCodes.map((code, idx) => (
        <Button
          key={code}
          variant={props.value === code ? 'default' : 'ghost'}
          size="sm"
          onClick={() => props.onChange?.(code)}
        >
          <ItemBackground level={(idx + 1) as WarEra.ArmorLevel}>
            <ItemImage itemCode={code} className="size-8" />
          </ItemBackground>
        </Button>
      ))}

      {armorTypes.map((armor) => (
        <Fragment key={armor}>
          <div>{armor}</div>
          {armorLevels.map((level) => (
            <Button
              key={level}
              variant={props.value === `${armor}${level}` ? 'default' : 'ghost'}
              size="sm"
              onClick={() => props.onChange?.(`${armor}${level}` as WarEra.EquipmentCode)}
            >
              <ItemBackground level={level}>
                <ItemImage itemCode={`${armor}${level}`} className="size-8" />
              </ItemBackground>
            </Button>
          ))}
        </Fragment>
      ))}
    </div>
  )
}
