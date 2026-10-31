import { useSyncExternalStore } from 'react'
export type Theme = 'light' | 'dark'
const key = 'cimer-theme'
const eventName = 'cimer-theme-change'
function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.dataset.theme = theme
  root.style.colorScheme = theme
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (meta) meta.content = theme === 'dark' ? '#10151e' : '#ffffff'
}
function subscribe(notify: () => void) {
  const storage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) {
      applyTheme(event.key === key && event.newValue === 'dark' ? 'dark' : 'light')
      notify()
    }
  }
  window.addEventListener(eventName, notify)
  window.addEventListener('storage', storage)
  return () => {
    window.removeEventListener(eventName, notify)
    window.removeEventListener('storage', storage)
  }
}
function currentTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}
export function setTheme(theme: Theme) {
  applyTheme(theme)
  try {
    localStorage.setItem(key, theme)
  } catch {
    /* Theme changes still work when storage is unavailable. */
  }
  window.dispatchEvent(new Event(eventName))
}
export function useTheme() {
  return useSyncExternalStore(subscribe, currentTheme, (): Theme => 'light')
}
