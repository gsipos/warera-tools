import { RouterProvider, createRouter } from '@tanstack/react-router'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './functions/react-query-setup'

const root = document.getElementById('root')
const reactRoot = ReactDOM.createRoot(root!)

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Create a new router instance
const router = createRouter({ routeTree })

reactRoot.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
)
