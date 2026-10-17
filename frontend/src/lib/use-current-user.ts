import { useLocalState } from './use-local-state'
import type { UserProfile } from './profile-store'
export function useCurrentUser() {
  const [session] = useLocalState<{ email: string } | null>('cimer-user', null)
  const [profiles] = useLocalState<UserProfile[]>('cimer-profiles', [])
  const id = session?.email?.trim().toLowerCase()
  return profiles.find((user) => user.id === id) || null
}
