import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

type ProvidersProps = {
  children: ReactNode
}

// Svi globalni provideri aplikacije na jednom mjestu (keš za podatke, kasnije npr. tema ili prijava).
export function Providers({ children }: ProvidersProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
