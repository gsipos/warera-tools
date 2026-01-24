import { useUserLite } from '@/api/warera-api'
import { Skeleton } from '../ui/skeleton'
import { Button } from '../ui/button'
import { UserAvatar } from '../organisms/UserCard'
import { Link } from '@tanstack/react-router'
import { useCountry } from '@/hooks/game/useCountry'
import { CountryFlag } from './CountryFlag'

export const CountryNavLink = (props: { countryId: string }) => {
  const country = useCountry(props.countryId)

  if (!country) return <Skeleton className="h-5 w-20" />

  return (
    <Button variant="link" asChild>
      <Link to={`/countries/${country._id}`}>
        <CountryFlag code={country.code} /> {country.name}
      </Link>
    </Button>
  )
}
