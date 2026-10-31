import { useMutation } from '@tanstack/react-query'
import { authApi } from './auth-api'
export function useSignIn() {
  return useMutation({ mutationFn: authApi.login })
}
export function useRegister() {
  return useMutation({ mutationFn: authApi.register })
}
