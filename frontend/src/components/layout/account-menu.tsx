import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { ArrowUpRight, ChevronDown, LogOut, UserRound, List, MessageCircle } from 'lucide-react'
import { useCurrentUserState } from '@/lib/use-current-user'
import { SignOutDialog } from './sign-out-dialog'
export function AccountMenu() {
  const { user, isPending, isError } = useCurrentUserState()
  const [open, setOpen] = useState(false)
  const [confirmSignOut, setConfirmSignOut] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const location = useLocation()
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
  if (isPending)
    return (
      <span className="login-link" role="status">
        Učitavam profil...
      </span>
    )
  if (!user)
    return (
      <Link className="login-link" to="/login">
        {isError ? 'Provjeri prijavu' : 'Prijavi se'} <ArrowUpRight size={15} />
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
      <SignOutDialog
        open={confirmSignOut}
        onClose={() => {
          setConfirmSignOut(false)
          trigger.current?.focus()
        }}
      />
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
          <Link to="/my-listings">
            <List size={17} />
            Moji oglasi
          </Link>
          <Link to="/messages">
            <MessageCircle size={17} />
            Poruke
          </Link>
          <button
            onClick={() => {
              setConfirmSignOut(true)
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
