import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { listingsApi } from './listings-api'
import type { NewListing } from '../types'

function useProfileRefresh() {
  const client = useQueryClient()
  useEffect(() => {
    const refresh = () => {
      void client.invalidateQueries({ queryKey: ['listings'] })
    }
    window.addEventListener('storage', refresh)
    return () => window.removeEventListener('storage', refresh)
  }, [client])
}

export function useListings(search = '') {
  useProfileRefresh()
  return useQuery({
    queryKey: ['listings', search],
    queryFn: () => listingsApi.list(search),
  })
}

export function useListing(id: number) {
  useProfileRefresh()
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
