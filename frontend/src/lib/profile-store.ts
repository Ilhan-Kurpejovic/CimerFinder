// Shared persistence contract used by users, authentication and listing projections.
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
export const defaultAvatar = '/profile-placeholder.svg'
export function readProfiles(): UserProfile[] {
  try {
    const data = JSON.parse(localStorage.getItem('cimer-profiles') || '[]')
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}
export function sessionId(): string | null {
  try {
    const user = JSON.parse(localStorage.getItem('cimer-user') || 'null')
    return typeof user?.email === 'string' ? user.email.trim().toLowerCase() : null
  } catch {
    return null
  }
}
export function currentProfile() {
  return readProfiles().find((user) => user.id === sessionId()) || null
}
export function notifyProfileChange() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage'))
}
export function saveProfiles(profiles: UserProfile[]) {
  localStorage.setItem('cimer-profiles', JSON.stringify(profiles))
  notifyProfileChange()
}
export function ensureProfile(email: string): UserProfile {
  const normalized = email.trim().toLowerCase()
  const profiles = readProfiles()
  const existing = profiles.find((user) => user.id === normalized)
  if (existing) return existing
  let legacyName = ''
  try {
    const legacy = JSON.parse(localStorage.getItem('cimer-user') || 'null')
    if (legacy?.email?.trim().toLowerCase() === normalized) legacyName = legacy.name
  } catch {
    /* No legacy session. */
  }
  const raw = normalized.split('@')[0]
  const profile: UserProfile = {
    id: normalized,
    email: normalized,
    name: legacyName || raw.charAt(0).toUpperCase() + raw.slice(1),
    age: null,
    occupation: '',
    city: '',
    bio: '',
    avatar: defaultAvatar,
  }
  saveProfiles([...profiles, profile])
  return profile
}
export function signIn(email: string) {
  const profile = ensureProfile(email)
  localStorage.setItem(
    'cimer-user',
    JSON.stringify({ id: profile.id, name: profile.name, email: profile.email }),
  )
  notifyProfileChange()
  return profile
}
export function signOut() {
  localStorage.setItem('cimer-user', 'null')
  notifyProfileChange()
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
