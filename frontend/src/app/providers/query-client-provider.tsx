import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (failureCount) => failureCount < 3,
      retryDelay: (attemptIndex) => {
        const baseDelay = 500
        const exponentialDelay = baseDelay * 2 ** attemptIndex
        return Math.min(exponentialDelay, 30_000)
      },
      refetchOnWindowFocus: false,
    },
  },
})

export type QueryClientProviderProps = {
  children: ReactNode
}

export const AppQueryClientProvider = ({ children }: QueryClientProviderProps) => {
  return <QueryClientProvider client={defaultQueryClient}>{children}</QueryClientProvider>
}
