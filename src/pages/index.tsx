import { CountryNavLink } from '@/components/molecules/CountryNavLink'
import { UserNavLink } from '@/components/molecules/UserNavLink'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item'
import { Separator } from '@/components/ui/separator'
import { useFavouriteState } from '@/hooks/use-favourite-state'
import { createFileRoute, Link } from '@tanstack/react-router'
import { EarthIcon, ExternalLinkIcon, FlagIcon, HandshakeIcon, PickaxeIcon, StoreIcon } from 'lucide-react'
import { ReactNode } from 'react'

export const Route = createFileRoute('/')({
  component: Index,
})

interface NavCard {
  title: string
  description: string
  link: string
  icon: ReactNode
}

const navCards: NavCard[] = [
  {
    icon: <FlagIcon />,
    title: 'Countries',
    description: 'Explore detailed information about all countries in WarEra.',
    link: '/countries/',
  },
  {
    icon: <EarthIcon />,
    title: 'Regions',
    description: 'Explore detailed information about all regions in WarEra.',
    link: '/regions/',
  },
  {
    icon: <HandshakeIcon />,
    title: 'Alliances',
    description: 'View the alliance relationships between countries in WarEra.',
    link: '/countries/alliances/',
  },
  {
    icon: <PickaxeIcon />,
    title: 'Deposits',
    description: 'Explore detailed information about all deposits in WarEra.',
    link: '/deposits/',
  },
]

const depositNavCards: NavCard[] = [
  {
    icon: <PickaxeIcon />,
    title: 'Deposits',
    description: 'Explore detailed information about all deposits in WarEra.',
    link: '/deposits/',
  },
]

const marketNavCards: NavCard[] = [
  {
    icon: <StoreIcon />,
    title: 'Item Market',
    description: 'Item Market analysis and prices',
    link: '/itemMarket/',
  },
]

const NavCardComponent = ({ card }: { card: NavCard }) => {
  return (
    <Item variant="outline" asChild>
      <Link to={card.link}>
        <ItemMedia>{card.icon}</ItemMedia>
        <ItemContent>
          <ItemTitle>{card.title}</ItemTitle>
          <ItemDescription>{card.description}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <ExternalLinkIcon />
        </ItemActions>
      </Link>
    </Item>
  )
}

const ItemGroupSubTitle = ({ children }: { children: ReactNode }) => {
  return (
    <Item>
      <ItemContent>
        <ItemTitle className="text-muted-foreground text-xs uppercase">{children}</ItemTitle>
      </ItemContent>
    </Item>
  )
}

const FavouritesGroup = () => {
  const favourites = useFavouriteState().favourites

  const users = favourites.filter((f) => f.type === 'user')
  const countries = favourites.filter((f) => f.type === 'country')

  return (
    <ItemGroup className="gap-2">
      <ItemGroupSubTitle>Favourites</ItemGroupSubTitle>
      {users.map((favourite) => (
        <Item>
          <ItemContent>
            <ItemTitle>
              <UserNavLink userId={favourite.id} />
            </ItemTitle>
          </ItemContent>
        </Item>
      ))}
      <ItemSeparator />

      {countries.map((favourite) => (
        <Item>
          <ItemContent>
            <ItemTitle>
              <CountryNavLink countryId={favourite.id} />
            </ItemTitle>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  )
}

function Index() {
  return (
    <div className="flex flex-row flex-wrap gap-8 p-4">
      <div className="flex w-full flex-col gap-2">
        <h1 className="text-2xl font-bold">Welcome to WarEra tools!</h1>
        <div className="text-muted-foreground text-lg">Dashboards and tools to help you with the game!</div>
      </div>

      <ItemGroup className="gap-2">
        <ItemGroupSubTitle>Countries</ItemGroupSubTitle>
        {navCards.map((card) => (
          <NavCardComponent key={card.title} card={card} />
        ))}
      </ItemGroup>

      <ItemGroup className="gap-2">
        <ItemGroupSubTitle>Deposits</ItemGroupSubTitle>
        {depositNavCards.map((card) => (
          <NavCardComponent key={card.title} card={card} />
        ))}
      </ItemGroup>

      <ItemGroup className="gap-2">
        <ItemGroupSubTitle>Market</ItemGroupSubTitle>
        {marketNavCards.map((card) => (
          <NavCardComponent key={card.title} card={card} />
        ))}
      </ItemGroup>

      <FavouritesGroup />
    </div>
  )
}
