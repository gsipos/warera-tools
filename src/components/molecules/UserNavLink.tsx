import { useUserLite } from '@/api/warera-api'
import { Skeleton } from '../ui/skeleton'
import { Button } from '../ui/button'
import { UserAvatar } from '../organisms/UserCard'
import { Link } from '@tanstack/react-router'

export const UserNavLink = (props: { userId: string; onNavigate?: () => void }) => {
  const userQuery = useUserLite(props.userId)
  const user = userQuery.data

  if (!user) return <Skeleton className="h-5 w-20" />

  return (
    <Button variant="link" asChild onClick={props.onNavigate} className="w-full justify-start overflow-hidden">
      <Link to={`/users/${user._id}`} className="flex w-full items-center gap-2 truncate">
        <UserAvatar user={user} className="size-5 shrink-0" />
        <span className="truncate">{user.username}</span>
      </Link>
    </Button>
  )
}
