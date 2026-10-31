import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCurrentUser } from '@/lib/use-current-user'
import { listingsApi } from './listings-api'
import type { ListingFilters } from './listings-api'
import type { NewListing } from '../types'
export function useListingsPage(search = '', filters: ListingFilters = {}) {
  const user = useCurrentUser()
  return useQuery({
    queryKey: ['listings', search, filters, filters.mine || filters.favorites ? user?.id : 'public'],
    queryFn: () => listingsApi.listPage(search, filters),
    enabled: (!filters.mine && !filters.favorites) || !!user,
    retry: false,
  })
}
export function useListings(search = '', filters: ListingFilters = {}) {
  const query = useListingsPage(search, filters)
  return { ...query, data: query.data?.items }
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
export function useDeleteListing() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: listingsApi.remove,
    onSuccess: () => client.invalidateQueries({ queryKey: ['listings'] }),
  })
}
export function useUpdateListing() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, changes }: { id: number; changes: Partial<NewListing> }) =>
      listingsApi.update(id, changes),
    onSuccess: () => client.invalidateQueries({ queryKey: ['listings'] }),
  })
}
