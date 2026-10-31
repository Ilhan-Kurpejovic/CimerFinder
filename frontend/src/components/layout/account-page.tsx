import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router'
import { ArrowLeft, ArrowUpRight, List, MessageCircle, UserRound } from 'lucide-react'
import { useCurrentUserState } from '@/lib/use-current-user'
import { SessionStatus } from './session-status'

export function AccountPage({
  section,
  children,
}: {
  section: 'profile' | 'listings' | 'messages'
  children: ReactNode
}) {
  const { user, isPending, isError, error, refetch } = useCurrentUserState()
  if (isPending || isError)
    return <SessionStatus error={isError ? error : undefined} retry={() => refetch()} />
  if (!user)
    return (
      <div className="container page-content">
        <div className="empty-state">
          <UserRound size={32} />
          <h1>Tvoj kutak te čeka.</h1>
          <p>Prijavi se da urediš profil i upravljaš svojim oglasima.</p>
          <Link
            className="btn btn-primary"
            to={
              '/login?next=' +
              (section === 'profile' ? '/profile' : section === 'messages' ? '/messages' : '/my-listings')
            }
          >
            Prijavi se
          </Link>
        </div>
      </div>
    )
  return (
    <div className="container page-content account-page">
      <Link className="back-link" to="/">
        <ArrowLeft size={15} />
        Nazad na početnu
      </Link>
      <header className="account-page-header">
        <div>
          <span className="eyebrow">TVOJ KUTAK NA CIMERFINDERU</span>
          <h1>
            {section === 'profile'
              ? 'Tvoj profil, tvoja priča.'
              : section === 'messages'
                ? 'Dobre priče počinju porukom.'
                : 'Tvoji oglasi, na jednom mjestu.'}
          </h1>
          <p>
            {section === 'profile'
              ? 'Predstavi se budućim cimerima. Mi ćemo tvoje oglase povezati sa tvojom pričom.'
              : section === 'messages'
                ? 'Upoznaj buduće cimere i dogovori sljedeći korak, na jednom mjestu.'
                : 'Uredi detalje, promijeni status i napravi prostor za nove početke.'}
          </p>
        </div>
        {section === 'listings' && (
          <Link className="account-header-link" to="/profile">
            Uredi svoj profil
            <ArrowUpRight size={17} />
          </Link>
        )}
      </header>
      <nav className="account-page-nav" aria-label="Tvoj nalog">
        <NavLink to="/profile" end>
          <UserRound size={17} />
          Moj profil
        </NavLink>
        <NavLink to="/my-listings" end>
          <List size={17} />
          Moji oglasi
        </NavLink>
        <NavLink to="/messages">
          <MessageCircle size={17} />
          Poruke
        </NavLink>
      </nav>
      {children}
    </div>
  )
}
