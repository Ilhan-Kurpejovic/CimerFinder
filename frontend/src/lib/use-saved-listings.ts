import { useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCurrentUser } from './use-current-user'
import { useLocalState } from './use-local-state'
import { favoritesApi } from './favorites-api'
import { apiMessage } from './api-client'
export function useSavedListings() {
  const user = useCurrentUser()
  const client = useQueryClient()
  const [guest, setGuest] = useLocalState<number[]>('cimer-api-saved:guest', [])
  const key = ['favorites', user?.id]
  const query = useQuery({ queryKey: key, queryFn: favoritesApi.ids, enabled: !!user, retry: false })
  const mutation = useMutation({
    mutationKey: key,
    mutationFn: ({ id, save }: { id: number; save: boolean }) =>
      save ? favoritesApi.save(id) : favoritesApi.remove(id),
    onSuccess: (_, { id, save }) => {
      client.setQueryData<number[]>(key, (previous) =>
        save ? [...new Set([...(previous || []), id])] : (previous || []).filter((value) => value !== id),
      )
    },
    onSettled: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: key }),
        client.invalidateQueries({ queryKey: ['listings'] }),
      ]),
  })
  const writing = useIsMutating({ mutationKey: key }) > 0
  const saved = user ? query.data || [] : guest
  const pending = !!user && (query.isPending || writing)
  const toggle = (id: number) => {
    if (pending || (user && query.isError)) return
    if (!user) {
      setGuest(saved.includes(id) ? saved.filter((value) => value !== id) : [...saved, id])
      return
    }
    mutation.mutate({ id, save: !saved.includes(id) })
  }
  const error = user ? query.error || mutation.error : null
  return [
    saved,
    toggle,
    {
      pending,
      error: error ? apiMessage(error) : '',
      retry: () => {
        mutation.reset()
        void query.refetch()
      },
      signedIn: !!user,
    },
  ] as const
}
