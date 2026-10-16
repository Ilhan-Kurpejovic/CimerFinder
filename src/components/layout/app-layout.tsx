import { NavLink, Outlet } from 'react-router'

import { cn } from '@/lib/utils'

const linkovi = [
  { to: '/', label: 'Početna' },
  { to: '/oglasi', label: 'Oglasi' },
]

export function AppLayout() {
  return (
    <div className="min-h-dvh">
      <header className="border-b bg-card">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="font-heading text-lg font-bold text-primary">Naziv aplikacije</span>
          <ul className="flex gap-6 text-sm">
            {linkovi.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end
                  className={({ isActive }) =>
                    cn(
                      'text-muted-foreground hover:text-foreground',
                      isActive && 'font-semibold text-foreground',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
