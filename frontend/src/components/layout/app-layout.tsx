import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { ArrowUpRight, Heart, House, Menu, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AccountMenu } from './account-menu'
export function AppLayout() {
  const [open, setOpen] = useState(false)
  const { pathname, hash } = useLocation()
  useEffect(() => {
    setOpen(false)
    if (hash) requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView())
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand" aria-label="CimerFinder početna">
            <span className="brand-icon">
              <House size={21} strokeWidth={2.2} />
            </span>
            Cimer<span>Finder</span>
            <i />
          </Link>
          <button
            className="mobile-toggle"
            aria-label={open ? 'Zatvori meni' : 'Otvori meni'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
          <nav className={open ? 'main-nav open' : 'main-nav'} aria-label="Glavna navigacija">
            <NavLink to="/" end>
              Početna
            </NavLink>
            <NavLink to="/listings">Pronađi dom</NavLink>
            <NavLink to="/roommates">Pronađi cimera</NavLink>
            <NavLink className="mobile-nav-link" to="/saved">
              Sačuvani oglasi
            </NavLink>
            <NavLink className="mobile-nav-link" to="/post">
              Objavi oglas
            </NavLink>
            <Link to="/#kako-funkcionise">Kako funkcioniše</Link>
          </nav>
          <div className="header-actions">
            <Link className="saved-nav" to="/saved" aria-label="Sačuvani oglasi">
              <Heart size={20} />
            </Link>
            <AccountMenu />
            <Link className="btn btn-primary nav-post" to="/post">
              <Plus size={16} />
              Objavi oglas
            </Link>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-top">
          <div>
            <Link className="brand" to="/">
              <span className="brand-icon">
                <House size={20} />
              </span>
              Cimer<span>Finder</span>
              <i />
            </Link>
            <p>Dobar dom počinje dobrim cimerom.</p>
          </div>
          <div className="footer-links">
            <Link to="/listings">Pronađi dom</Link>
            <Link to="/roommates">Pronađi cimera</Link>
            <Link to="/post">
              Objavi oglas <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} CimerFinder. Napravljeno za zajedničke početke.</span>
          <span>Demo aplikacija · Podaci se čuvaju na tvom uređaju.</span>
        </div>
      </footer>
    </div>
  )
}
