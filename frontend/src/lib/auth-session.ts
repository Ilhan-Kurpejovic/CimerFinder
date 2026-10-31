import { useSyncExternalStore } from 'react'
const key = 'cimer-api-token'
export const authEvent = 'cimer-auth-change'
export function getAccessToken(): string | null {
  return sessionStorage.getItem(key)
}
export function setAccessToken(token: string | null) {
  if (token) sessionStorage.setItem(key, token)
  else sessionStorage.removeItem(key)
  window.dispatchEvent(new Event(authEvent))
}
const subscribe = (callback: () => void) => {
  window.addEventListener(authEvent, callback)
  return () => window.removeEventListener(authEvent, callback)
}
export function useAccessToken() {
  return useSyncExternalStore(subscribe, getAccessToken)
}
