import { useQuery } from '@tanstack/react-query'

import { oglasiApi } from '@/api/oglasi'

export function useOglasi(pretraga: string) {
  return useQuery({
    queryKey: ['oglasi', pretraga],
    queryFn: () => oglasiApi.list(pretraga),
  })
}
