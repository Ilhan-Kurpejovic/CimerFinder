import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { authEvent } from '@/lib/auth-session'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

type ProvidersProps = {
  children: ReactNode
}

// All global providers in one place (data cache now, later e.g. theme or auth).
export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    const clear = () => queryClient.clear()
    window.addEventListener(authEvent, clear)
    return () => window.removeEventListener(authEvent, clear)
  }, [])
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
