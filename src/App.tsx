import { QueryClientProvider } from '@tanstack/react-query'
import { useAllCountries } from './api/warera-api'
import { queryClient } from './functions/react-query-setup'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export const CountryList = () => {
  const countryQuery = useAllCountries()

  const countries = countryQuery.data || []

  return (
    <div>
      {countries.map((country) => (
        <div key={country._id}>
          <h2>
            {country.name} ({country.code})
          </h2>
          <p>Money: {country.money}</p>
        </div>
      ))}
    </div>
  )
}

export const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <div>Welcome to War Era Tools!</div>
            <ReactQueryDevtools initialIsOpen={false} position="bottom" buttonPosition="bottom-left" />
        </QueryClientProvider>
    )
}
