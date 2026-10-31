import { useQuery } from '@tanstack/react-query'
import { useAccessToken } from './auth-session'
import { getCurrentProfile } from './current-user-api'
export function useCurrentUserState() {
  const token = useAccessToken()
  const query = useQuery({
    queryKey: ['users', 'me', token],
    queryFn: getCurrentProfile,
    enabled: !!token,
    retry: false,
    staleTime: 30_000,
  })
  return {
    ...query,
    user: token ? (query.data ?? null) : null,
    isPending: !!token && query.isPending,
    isError: !!token && query.isError,
  }
}
export function useCurrentUser() {
  return useCurrentUserState().user
}
