import { apiRequest } from '@/lib/api-client'
import { defaultAvatar, toProfile } from '@/lib/profile-store'
import type { ServerUser } from '@/lib/profile-store'
import type { ProfileChanges } from '../types'
export type PublicUser = {
  id: number
  displayName: string
  age: number | null
  occupation: string
  city: string
  bio: string
  avatarUrl: string | null
}
export const usersApi = {
  getPublic: (id: number) => apiRequest<PublicUser>('/users/' + id + '/public'),
  getCurrent: async () => toProfile(await apiRequest<ServerUser>('/users/me')),
  updateCurrent: async (changes: ProfileChanges) =>
    toProfile(
      await apiRequest<ServerUser>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          displayName: changes.name,
          age: changes.age,
          occupation: changes.occupation,
          city: changes.city,
          bio: changes.bio,
          avatarUrl:
            changes.avatar === undefined
              ? undefined
              : changes.avatar === defaultAvatar || !changes.avatar
                ? null
                : changes.avatar,
        }),
      }),
    ),
}
