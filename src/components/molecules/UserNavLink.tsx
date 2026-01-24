import { useUserLite } from '@/api/warera-api'
import { Skeleton } from '../ui/skeleton'
import { Button } from '../ui/button'
import { UserAvatar } from '../organisms/UserCard'
import { Link } from '@tanstack/react-router'

export const UserNavLink = (props: { userId: string }) => {
  const userQuery = useUserLite(props.userId)
  const user = userQuery.data

  if (!user) return <Skeleton className="h-5 w-20" />

  return (
    <Button variant="link" asChild>
      <Link to={`/users/${user._id}`}>
        <UserAvatar user={user} className="size-5" />
        {user.username}
      </Link>
    </Button>
  )
}
