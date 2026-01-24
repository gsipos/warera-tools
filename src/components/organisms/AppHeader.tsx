import { itemCodes } from '@/api/warera-api-schema'
import { depositItemCodes } from '@/api/warera-item-recipes'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { useIsMobile } from '@/hooks/use-mobile'
import { Separator } from '@radix-ui/react-separator'
import { Link } from '@tanstack/react-router'
import { Network, RefreshCwIcon, ToolCaseIcon } from 'lucide-react'
import { LoadingIndicator } from '../molecules/LoadingIndicator'
import { Button } from '../ui/button'
import { SimpleTooltip } from '../ui/tooltip'
import { useQueryClient } from '@tanstack/react-query'
import { useFavouriteState } from '@/hooks/use-favourite-state'
import { UserNavLink } from '../molecules/UserNavLink'
import { CountryNavLink } from '../molecules/CountryNavLink'
import { NetworkHealth } from '../molecules/NetworkHealth'
import { cn } from '@/lib/utils'

interface NavLinkk {
  title: string
  href: string
  description: string
}

const mapLinks: NavLinkk[] = [
  {
    title: 'Countries',
    href: '/countries',
    description: 'List of all countries.',
  },
  {
    title: 'Regions',
    href: '/regions',
    description: 'List of all regions.',
  },
  {
    title: 'Alliances',
    href: '/countries/alliances',
    description: 'Chart of all alliances.',
  },
]

const depositLinks: NavLinkk[] = [
  {
    title: 'Deposits',
    href: '/deposits',
    description: 'List of all deposits.',
  },
  ...depositItemCodes.map((code) => ({
    title: `Deposit: ${code}`,
    href: `/itemDeposits/${code}`,
    description: `Regions with deposit type: ${code}.`,
  })),
]

const marketLinks: NavLinkk[] = [
  {
    title: 'Item Market',
    href: '/itemMarket',
    description: 'Item Market analysis and prices.',
  },
]

const NavLinkGroup = (props: { links: NavLinkk[]; groupTitle: string }) => {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>{props.groupTitle}</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
          {props.links.map((component) => (
            <ListItem key={component.title} title={component.title} href={component.href}>
              {component.description}
            </ListItem>
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}

const NavFavouritesGroup = () => {
  const favouriteState = useFavouriteState()

  const users = favouriteState.favourites.filter((f) => f.type === 'user')
  const countries = favouriteState.favourites.filter((f) => f.type === 'country')

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>Favourites</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
          {users.map((favourite) => (
            <li key={favourite.id}>
              <NavigationMenuLink asChild>
                <UserNavLink userId={favourite.id} />
              </NavigationMenuLink>
            </li>
          ))}
          {countries.map((favourite) => (
            <li key={favourite.id}>
              <NavigationMenuLink asChild>
                <CountryNavLink countryId={favourite.id} />
              </NavigationMenuLink>
            </li>
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}

function AppNavigationMenu() {
  const isMobile = useIsMobile()

  return (
    <NavigationMenu viewport={isMobile}>
      <NavigationMenuList className="flex-wrap">
        <NavigationMenuItem>
          <NavigationMenuTrigger>Home</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-4 no-underline outline-hidden transition-all duration-200 select-none focus:shadow-md md:p-6"
                    href="/"
                  >
                    <div className="mb-2 text-lg font-medium sm:mt-4">War Era tools</div>
                    <p className="text-muted-foreground text-sm leading-tight">
                      All the help you can get for War Era (legally).
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>

              {/* <ListItem href="/docs" title="Introduction">
                Re-usable components built using Radix UI and Tailwind CSS.
              </ListItem>
              <ListItem href="/docs/installation" title="Installation">
                How to install dependencies and structure your app.
              </ListItem>
              <ListItem href="/docs/primitives/typography" title="Typography">
                Styles for headings, paragraphs, lists...etc
              </ListItem> */}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavLinkGroup links={mapLinks} groupTitle="Map" />
        <NavLinkGroup links={depositLinks} groupTitle="Deposits" />
        <NavLinkGroup links={marketLinks} groupTitle="Market" />
        <NavFavouritesGroup />
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function ListItem({ title, children, href, ...props }: React.ComponentPropsWithoutRef<'li'> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link to={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">{children}</p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}

export const RefreshDataButton = () => {
  const queryClient = useQueryClient()

  const handleRefresh = async () => {
    await queryClient.invalidateQueries()
  }

  return (
    <SimpleTooltip tooltip="Refresh Data">
      <Button onClick={handleRefresh} size="icon-sm" variant="ghost">
        <RefreshCwIcon />
      </Button>
    </SimpleTooltip>
  )
}

export const AppHeader = () => {
  const isMobile = useIsMobile()
  return (
    <>
      <div className={cn('flex flex-row flex-wrap justify-between gap-4 p-2', isMobile && 'flex-col justify-start')}>
        <h1 className="flex flex-row items-center gap-2 text-lg font-bold">
          <ToolCaseIcon />
          War Era Tools
        </h1>

        <AppNavigationMenu />

        <div className="flex shrink-1 grow-1" />
        <div className={cn('flex flex-row gap-1', isMobile && 'justify-end')}>
          <NetworkHealth />
          <RefreshDataButton />
        </div>
      </div>
      <Separator className="my-2" />
    </>
  )
}
