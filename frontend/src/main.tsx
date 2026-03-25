import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/500.css'
import '@fontsource/manrope/700.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/700.css'

import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'

import { queryClient } from '#/api/queryClient'
import { getRouter } from '@/router'
import { initOfflineInterceptor, initSyncManager } from '@/pwa'

// PWA: queue mutations when offline (must run before initResponseHandler)
initOfflineInterceptor()
// PWA: replay queued mutations when back online
initSyncManager()

const router = getRouter()

const rootElement = document.getElementById('app')

if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
}