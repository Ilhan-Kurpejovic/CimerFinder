import { Navigate, useLocation } from 'react-router'
import { ProfilePanel } from '@/features/users/components/profile-panel'
export function Profile() {
  const { hash } = useLocation()
  if (hash === '#moji-oglasi') return <Navigate to="/my-listings" replace />
  return <ProfilePanel />
}
