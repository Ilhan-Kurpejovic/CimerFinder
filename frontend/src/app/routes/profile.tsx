import { ProfilePanel } from '@/features/users/components/profile-panel'
import { MyListings } from '@/features/listings/components/my-listings'
export function Profile() {
  return (
    <ProfilePanel>
      <MyListings />
    </ProfilePanel>
  )
}
