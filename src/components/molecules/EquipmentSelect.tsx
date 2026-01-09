import { armorCodes, weaponsCodes } from '@/api/warera-api-schema'
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SelectGroup } from '@radix-ui/react-select'
import { WarEra } from 'warera-api'

interface Props {
  className?: string
  value?: WarEra.EquipmentCode
  onChange?: (value: WarEra.EquipmentCode) => void
}

export const EquipmentSelect = (props: Props) => {
  return (
    <Select value={props.value ?? ''} onValueChange={(v) => props.onChange?.(v as WarEra.EquipmentCode)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="All items" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Weapons</SelectLabel>
          {weaponsCodes.map((code) => (
            <SelectItem key={code} value={code}>
              {code}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Armors</SelectLabel>
          {armorCodes.map((code) => (
            <SelectItem key={code} value={code}>
              {code}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
