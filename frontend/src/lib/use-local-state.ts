import { useSyncExternalStore } from 'react'
const subscribe = (callback: () => void) => {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}
export function useLocalState<T>(key: string, fallback: T): [T, (value: T) => void] {
  const raw = useSyncExternalStore(subscribe, () => localStorage.getItem(key))
  let value = fallback
  try {
    if (raw) value = JSON.parse(raw) as T
  } catch {
    /* Fall back to the default for invalid local data. */
  }
  return [
    value,
    (next: T) => {
      localStorage.setItem(key, JSON.stringify(next))
      window.dispatchEvent(new Event('storage'))
    },
  ]
}
