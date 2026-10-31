import { apiRequest } from '@/lib/api-client'
import { setAccessToken } from '@/lib/auth-session'
import { toProfile } from '@/lib/profile-store'
import type { ServerUser } from '@/lib/profile-store'
export type Credentials = { email: string; password: string }
export type Registration = Credentials & { displayName: string }
type Authentication = { token: string; user: ServerUser }
async function authenticate(path: string, values: Credentials | Registration) {
  const result = await apiRequest<Authentication>(path, { method: 'POST', body: JSON.stringify(values) })
  setAccessToken(result.token)
  return toProfile(result.user)
}
export const authApi = {
  login: (values: Credentials) => authenticate('/auth/login', values),
  register: (values: Registration) => authenticate('/auth/register', values),
}
