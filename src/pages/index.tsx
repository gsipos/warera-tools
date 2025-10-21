import { Button } from '@/components/ui/button'
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="grid grid-cols-4 gap-8 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to WarEra tools!</CardTitle>
          <CardDescription>Dashboards and tools to help you with the game!</CardDescription>
        </CardHeader>
      </Card>

      <Separator className="col-span-full" />

      <div className="text-primary col-span-full text-lg">Countries</div>

      <Card>
        <CardHeader>
          <CardTitle>Country List</CardTitle>
          <CardDescription>Explore detailed information about all countries in WarEra.</CardDescription>
          <CardAction>
            <Button variant="link" asChild>
              <Link to="/countries/">View</Link>
            </Button>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  )
}
