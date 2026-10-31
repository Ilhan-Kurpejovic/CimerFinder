import { apiRequest } from './api-client'
import { toProfile } from './profile-store'
import type { ServerUser } from './profile-store'
export async function getCurrentProfile() {
  return toProfile(await apiRequest<ServerUser>('/auth/me'))
}
