import { cn } from '@/lib/utils'
import emojiFlags from 'emoji-flags'
import { WarEra } from 'warera-api'

interface Props {
  code: WarEra.Country['code']
  className?: string
}

export const CountryFlag = (props: Props) => {
  const fixeCode = props.code === 'uk' ? 'gb' : props.code

  return (
    <div className={cn('font-emoji text-lg', props.className)}>
      {emojiFlags.countryCode(fixeCode)?.emoji ?? fixeCode}
    </div>
  )
}
