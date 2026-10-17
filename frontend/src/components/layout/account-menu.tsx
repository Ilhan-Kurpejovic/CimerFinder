import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { ArrowUpRight, ChevronDown, LogOut, UserRound, List } from 'lucide-react'
import { useCurrentUser } from '@/lib/use-current-user'
import { useLocalState } from '@/lib/use-local-state'
import { ensureProfile, signOut } from '@/lib/profile-store'
export function AccountMenu() {
  const user = useCurrentUser()
  const [session] = useLocalState<{ email: string } | null>('cimer-user', null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const location = useLocation()
  useEffect(() => {
    if (session?.email) {
      try {
        ensureProfile(session.email)
      } catch {
        setError(true)
      }
    }
  }, [session?.email])
  useEffect(() => {
    setOpen(false)
  }, [location])
  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [open])
  if (!user)
    return (
      <Link className="login-link" to="/login">
        {error ? 'Otvori prijavu' : 'Prijavi se'} <ArrowUpRight size={15} />
      </Link>
    )
  return (
    <div
      className="account-menu"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <button
        className="account-trigger"
        ref={trigger}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="account-links"
        aria-label={`Moj profil: ${user.name}`}
      >
        <img src={user.avatar} alt="" />
        <span>{user.name.split(' ')[0]}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="account-dropdown" id="account-links">
          <div className="account-summary">
            <strong>{user.name}</strong>
            <small>{user.email}</small>
          </div>
          <Link to="/profile">
            <UserRound size={17} />
            Moj profil
          </Link>
          <Link to="/profile#moji-oglasi">
            <List size={17} />
            Moji oglasi
          </Link>
          <button
            onClick={() => {
              signOut()
              setOpen(false)
            }}
          >
            <LogOut size={17} />
            Odjavi se
          </button>
        </div>
      )}
    </div>
  )
}
