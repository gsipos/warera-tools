import { useUserLite } from '@/api/warera-api'
import { Skeleton } from '../ui/skeleton'
import { Button } from '../ui/button'
import { UserAvatar } from '../organisms/UserCard'
import { Link } from '@tanstack/react-router'
import { useCountry } from '@/hooks/game/useCountry'
import { CountryFlag } from './CountryFlag'

export const CountryNavLink = (props: { countryId: string; onNavigate?: () => void }) => {
  const country = useCountry(props.countryId)

  if (!country) return <Skeleton className="h-5 w-20" />

  return (
    <Button variant="link" asChild onClick={props.onNavigate} className="w-full justify-start overflow-hidden">
      <Link to={`/countries/${country._id}`} className="flex w-full items-center gap-2 truncate">
        <CountryFlag code={country.code} className="shrink-0" />
        <span className="truncate">{country.name}</span>
      </Link>
    </Button>
  )
}
