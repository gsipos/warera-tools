import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { WarEra } from 'warera-api'
import { useTradingTopOrders } from './api/warera-api'
import { Money } from './components/molecules/Money'
import { queryClient } from './functions/react-query-setup'
import { useTopWorkOfferWage } from './hooks/game/use-top-work-offer-wage'

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
      
      <ReactQueryDevtools initialIsOpen={false} position="bottom" buttonPosition="bottom-right" />
    </QueryClientProvider>
  )
}
