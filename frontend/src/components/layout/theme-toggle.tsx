import { Moon, Sun } from 'lucide-react'
import { setTheme, useTheme } from '@/lib/theme'
export function ThemeToggle() {
  const theme = useTheme()
  const label = theme === 'dark' ? 'Uključi svijetli izgled' : 'Uključi tamni izgled'
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={label}
      title={label}
      aria-pressed={theme === 'dark'}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? (
        <Sun size={19} strokeWidth={1.8} aria-hidden="true" />
      ) : (
        <Moon size={19} strokeWidth={1.8} aria-hidden="true" />
      )}
    </button>
  )
}
