import { setAccessToken } from './auth-session'
// Shared profile contract used by authentication, listings and profile editing.
export type UserProfile = {
  id: string
  email: string
  name: string
  age: number | null
  occupation: string
  city: string
  bio: string
  avatar: string
}
export type ProfileChanges = Pick<UserProfile, 'name' | 'age' | 'occupation' | 'city' | 'bio' | 'avatar'>
export type ServerUser = {
  id: number
  email: string
  displayName: string
  age: number | null
  occupation: string
  city: string
  bio: string
  avatarUrl: string | null
}
export const defaultAvatar = '/profile-placeholder.svg'
export function toProfile(user: ServerUser): UserProfile {
  return {
    id: String(user.id),
    email: user.email,
    name: user.displayName,
    age: user.age,
    occupation: user.occupation,
    city: user.city,
    bio: user.bio,
    avatar: user.avatarUrl || defaultAvatar,
  }
}
export function signOut() {
  setAccessToken(null)
}
export function profileComplete(user: UserProfile | null): user is UserProfile & { age: number } {
  return (
    !!user &&
    user.name.trim().length >= 2 &&
    user.age !== null &&
    user.age >= 18 &&
    user.occupation.trim().length >= 2
  )
}
