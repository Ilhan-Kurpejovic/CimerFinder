import { AccountPage } from '@/components/layout/account-page'
import { useCurrentUser } from '@/lib/use-current-user'
import { ProfileEditor } from './profile-editor'
export function ProfilePanel() {
  const user = useCurrentUser()
  return <AccountPage section="profile">{user && <ProfileEditor key={user.id} user={user} />}</AccountPage>
}
