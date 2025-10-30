import { Button } from '@/components/ui/button'
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

interface NavCard {
  title: string
  description: string
  link: string
}

const navCards: NavCard[] = [
  {
    title: 'Countries',
    description: 'Explore detailed information about all countries in WarEra.',
    link: '/countries/',
  },
  {
    title: 'Regions',
    description: 'Explore detailed information about all regions in WarEra.',
    link: '/regions/',
  },
  {
    title: 'Alliances',
    description: 'View the alliance relationships between countries in WarEra.',
    link: '/countries/alliances/',
  },
  {
    title: 'Deposits',
    description: 'Explore detailed information about all deposits in WarEra.',
    link: '/deposits/',
  },
]

const depositNavCards: NavCard[] = [
  {
    title: 'Deposits',
    description: 'Explore detailed information about all deposits in WarEra.',
    link: '/deposits/',
  },
]

const NavCardComponent = ({ card }: { card: NavCard }) => {
  return (
    <Card key={card.title}>
      <CardHeader>
        <CardTitle>{card.title}</CardTitle>
        <CardDescription>{card.description}</CardDescription>
        <CardAction>
          <Button variant="outline" asChild>
            <Link to={card.link}>View</Link>
          </Button>
        </CardAction>
      </CardHeader>
    </Card>
  )
}

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

      {navCards.map((card) => (
        <NavCardComponent key={card.title} card={card} />
      ))}

      <Separator className="col-span-full" />

      <div className="text-primary col-span-full text-lg">Deposits</div>

      {depositNavCards.map((card) => (
        <NavCardComponent key={card.title} card={card} />
      ))}
    </div>
  )
}
