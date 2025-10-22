import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { asyncStoragePersister, queryClient } from './functions/react-query-setup'

const root = document.getElementById('root')
const reactRoot = ReactDOM.createRoot(root!)

// Import the generated route tree
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AppSplashScreen } from './components/organisms/AppSplashScreen'
import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({ routeTree })

reactRoot.render(
  <React.StrictMode>
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: asyncStoragePersister }}>
      <AppSplashScreen>
        <RouterProvider router={router} />
      </AppSplashScreen>
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  </React.StrictMode>,
)
