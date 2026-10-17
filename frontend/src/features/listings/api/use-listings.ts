import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { listingsApi } from './listings-api'

export function useListings(search = '') {
  return useQuery({
    queryKey: ['listings', search],
    queryFn: () => listingsApi.list(search),
  })
}

export function useListing(id: number) {
  return useQuery({ queryKey: ['listings', id], queryFn: () => listingsApi.get(id), retry: false })
}
export function useCreateListing() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: listingsApi.create,
    onSuccess: () => client.invalidateQueries({ queryKey: ['listings'] }),
  })
}
