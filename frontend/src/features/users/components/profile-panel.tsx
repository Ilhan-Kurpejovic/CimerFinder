import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { useCurrentUser } from '@/lib/use-current-user'
import { ProfileEditor } from './profile-editor'
export function ProfilePanel({ children }: { children: ReactNode }) {
  const user = useCurrentUser()
  if (!user)
    return (
      <div className="container page-content">
        <div className="empty-state">
          <h1>Tvoj profil te čeka.</h1>
          <p>Prijavi se da urediš profil i vidiš svoje oglase.</p>
          <Link className="btn btn-primary" to="/login">
            Prijavi se
          </Link>
        </div>
      </div>
    )
  return (
    <div className="container page-content">
      <div className="page-intro">
        <span className="eyebrow">TVOJE MESTO U ZAJEDNICI</span>
        <h1>Moj profil.</h1>
        <p>Predstavi sebe jednom — tvoji oglasi preuzimaju ažurne podatke i profilnu fotografiju.</p>
      </div>
      <ProfileEditor key={user.id} user={user} />
      {children}
    </div>
  )
}
