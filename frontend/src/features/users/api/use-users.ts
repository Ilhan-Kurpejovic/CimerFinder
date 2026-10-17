import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from './users-api'
export function useUpdateProfile() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: usersApi.updateCurrent,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['users'] }),
        client.invalidateQueries({ queryKey: ['listings'] }),
      ])
    },
  })
}
