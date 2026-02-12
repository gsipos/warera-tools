import { useUserLite } from '@/api/warera-api'
import { AppSplashScreen } from '@/components/organisms/AppSplashScreen'
import { UserCard } from '@/components/organisms/UserCard'
import { UserCompaniesCard } from '@/components/organisms/UserCompaniesCard'
import { UserCraftingCard } from '@/components/organisms/UserCraftingCard'
import { UserItemMarketCard } from '@/components/organisms/UserItemMarketCard'
import { UserTradingCard } from '@/components/organisms/UserTradingCard'
import { Button } from '@/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronLeftIcon } from 'lucide-react'

export const Route = createFileRoute('/users/$userId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { userId } = Route.useParams()
  const user = useUserLite(userId).data

  if (!user) {
    return <AppSplashScreen />
  }

  return (
    <div>
      <div>
        <Button variant="link" asChild className="self-start">
          <Link to={`/countries/${user.country}`}>
            <ChevronLeftIcon />
            Back to Country
          </Link>
        </Button>
      </div>
      <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 p-2">
        <UserCard user={user} key={user._id} />
        <UserCraftingCard userId={user._id} />
        <UserItemMarketCard userId={user._id} />
        <UserTradingCard userId={user._id} />
        <UserCompaniesCard userId={user._id} />
      </div>
    </div>
  )
}
