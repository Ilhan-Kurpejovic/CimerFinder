import { apiRequest } from './api-client'
export const favoritesApi = {
  ids: () => apiRequest<number[]>('/users/me/favorites'),
  save: (id: number) => apiRequest<void>('/users/me/favorites/' + id, { method: 'PUT' }),
  remove: (id: number) => apiRequest<void>('/users/me/favorites/' + id, { method: 'DELETE' }),
}
