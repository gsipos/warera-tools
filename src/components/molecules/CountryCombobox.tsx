import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useCountries } from '@/api/warera-api'
import { CountryFlag } from './CountryFlag'

interface Props {
  value?: string | undefined
  onChange?: (value: string | undefined) => void
}

export function CountryCombobox({ value, onChange }: Props) {
  const countryQuery = useCountries()
  const countries = countryQuery.data || []

  const [open, setOpen] = React.useState(false)

  const selectedCountry = countries.find((country) => country._id === value)
  const nameValue = selectedCountry?.name

  const onInnerChange = (val: string) => {
    const country = countries.find((country) => country.name === val)
    onChange?.(country ? country._id : undefined)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
          {selectedCountry ? (
            <>
              <CountryFlag code={selectedCountry?.code} /> {selectedCountry?.name}
            </>
          ) : (
            'Select country...'
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." className="h-9" />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country._id}
                  value={country.name}
                  onSelect={(currentValue) => {
                    onInnerChange(currentValue === nameValue ? '' : currentValue)
                    setOpen(false)
                  }}
                >
                  <CountryFlag code={country.code} />
                  {country.name}
                  <Check className={cn('ml-auto', nameValue === country.name ? 'opacity-100' : 'opacity-0')} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
