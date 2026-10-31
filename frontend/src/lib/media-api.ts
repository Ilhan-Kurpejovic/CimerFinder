import { apiRequest } from './api-client'
export type UploadedImage = {
  id: number
  url: string
  purpose: 'avatar' | 'listing'
  byteSize: number
  width: number
  height: number
}
export const mediaApi = {
  upload: (file: File, purpose: 'avatar' | 'listing') => {
    const body = new FormData()
    body.append('file', file)
    body.append('purpose', purpose)
    return apiRequest<UploadedImage>('/media', { method: 'POST', body })
  },
  remove: (id: number) => apiRequest<void>('/media/' + id, { method: 'DELETE' }),
}
export function isImageLocation(value: string) {
  return /^\/api\/media\/[a-f0-9]{32}\.webp$/.test(value) || /^https?:\/\//i.test(value)
}
