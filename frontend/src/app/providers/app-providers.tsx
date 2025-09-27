import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppQueryClientProvider } from './query-client-provider'

export type AppProvidersProps = {
  children: ReactNode
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <AppQueryClientProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </AppQueryClientProvider>
  )
}
