import { useQuery } from '@tanstack/react-query'

import { oglasiApi } from './oglasi-api'

export function useOglasi(pretraga: string) {
  return useQuery({
    queryKey: ['oglasi', pretraga],
    queryFn: () => oglasiApi.list(pretraga),
  })
}
