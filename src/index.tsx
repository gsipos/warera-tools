import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { queryClient } from './functions/react-query-setup'
import { Analytics } from '@vercel/analytics/react'

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
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<AppSplashScreen />}>
        <RouterProvider router={router} />
      </Suspense>
      <Analytics />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
)
