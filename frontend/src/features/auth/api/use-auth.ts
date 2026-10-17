import { useMutation, useQueryClient } from '@tanstack/react-query'
import { signIn } from '@/lib/profile-store'
import { delay } from '@/lib/mock-db'
export function useSignIn() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (email: string) => delay(signIn(email)),
    onSuccess: () => client.invalidateQueries({ queryKey: ['listings'] }),
  })
}
