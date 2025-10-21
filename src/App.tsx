import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Fragment } from 'react/jsx-runtime'
import { WarEra } from 'warera-api'
import { useCountries, useTradingTopOrders, useWorkOffers } from './api/warera-api'
import { Money } from './components/molecules/Money'
import { queryClient } from './functions/react-query-setup'
import { useTopWorkOfferWage } from './hooks/game/use-top-work-offer-wage'

export const CountryList = () => {
  const countryQuery = useCountries()
  useWorkOffers()

  const countries = countryQuery.data || []

  return (
    <div className="grid grid-cols-4 gap-1">
      {countries.map((country) => (
        <Fragment key={country._id}>
          <h2>{country.name}</h2>
          <div>({country.code})</div>
          <p>Money: {country.money}</p>
          <div>{country?.rankings?.countryProductionBonus.value}</div>
        </Fragment>
      ))}

      <ItemTradeOrders item="bread" />
      <ItemTradeOrders item="steel" />
      <ItemTradeOrders item="iron" />
      <ItemTradeOrders item="cocain" />
    </div>
  )
}

const ItemTradeOrders = (props: { item: WarEra.ItemCode }) => {
  const topOrdersQuery = useTradingTopOrders(props.item)
  const buyOrders = topOrdersQuery.data?.buyOrders || []
  const sellOrders = topOrdersQuery.data?.sellOrders || []

  const topSellPrice = sellOrders[0]?.price || 0
  const topBuyPrice = buyOrders[0]?.price || 0
  const spread = topSellPrice - topBuyPrice

  const wage = useTopWorkOfferWage()

  return (
    <div className="col-span-4 flex flex-row items-center gap-2 p-1">
      <div>{props.item}</div>
      <div>
        Buy: <Money amount={topBuyPrice} />
      </div>
      <div>
        Sell: <Money amount={topSellPrice} />
      </div>
      <div>
        Spread: <Money amount={spread} />
      </div>
    </div>
  )
}

export const TradingTopOrders = () => {}

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div>Welcome to War Era Tools!</div>
      <CountryList />
      <ReactQueryDevtools initialIsOpen={false} position="bottom" buttonPosition="bottom-right" />
    </QueryClientProvider>
  )
}
