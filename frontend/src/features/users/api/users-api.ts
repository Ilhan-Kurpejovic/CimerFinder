import { delay } from '@/lib/mock-db'
import { currentProfile, readProfiles, saveProfiles } from '@/lib/profile-store'
import type { ProfileChanges } from '../types'
export const usersApi = {
  getCurrent: () => delay(currentProfile()),
  updateCurrent: (changes: ProfileChanges) => {
    const current = currentProfile()
    if (!current) return Promise.reject(new Error('Prijavi se da urediš profil.'))
    const updated = { ...current, ...changes }
    saveProfiles(readProfiles().map((user) => (user.id === current.id ? updated : user)))
    return delay(updated)
  },
}
