import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { QUERY_CLIENT_DEFAULTS } from '../../shared/query/queryPolicy'

export function QueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            ...QUERY_CLIENT_DEFAULTS,
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
