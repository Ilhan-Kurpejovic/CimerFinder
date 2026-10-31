import { AccountPage } from '@/components/layout/account-page'
import { MyListings } from '@/features/listings/components/my-listings'
export function MyListingsPage() {
  return (
    <AccountPage section="listings">
      <MyListings />
    </AccountPage>
  )
}
