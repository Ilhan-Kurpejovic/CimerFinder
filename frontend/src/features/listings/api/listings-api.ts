import { apiRequest } from '@/lib/api-client'
import { isImageLocation } from '@/lib/media-api'
import { defaultAvatar } from '@/lib/profile-store'
import type { Listing, NewListing } from '../types'
export type ListingFilters = {
  city?: string
  kind?: 'room' | 'roommate'
  maxPrice?: number
  petFriendly?: boolean
  sort?: string
  ids?: number[]
  page?: number
  size?: number
  mine?: boolean
  favorites?: boolean
}
export type ListingPage = { items: Listing[]; total: number; pages: number }
type ServerListing = Omit<
  Listing,
  'userId' | 'name' | 'age' | 'occupation' | 'avatar' | 'authorBio' | 'imageUrl'
> & {
  ownerId: number
  imageUrl: string | null
  owner: {
    id: number
    displayName: string
    age: number | null
    occupation: string
    bio: string
    avatarUrl: string | null
  }
}
function toListing(item: ServerListing): Listing {
  const avatar = item.owner.avatarUrl || defaultAvatar
  return {
    ...item,
    userId: String(item.ownerId),
    name: item.owner.displayName,
    age: item.owner.age,
    occupation: item.owner.occupation,
    avatar,
    authorBio: item.owner.bio,
    imageUrls:
      item.kind === 'roommate'
        ? [avatar]
        : item.imageUrls?.length
          ? item.imageUrls
          : item.imageUrl
            ? [item.imageUrl]
            : [],
    imageUrl:
      item.kind === 'roommate' ? avatar : item.imageUrls?.[0] || item.imageUrl || '/room-placeholder.svg',
  }
}
function body(input: Partial<NewListing>) {
  const result: Record<string, unknown> = {}
  for (const key of [
    'kind',
    'status',
    'title',
    'description',
    'city',
    'neighborhood',
    'price',
    'area',
    'roommates',
    'tags',
  ] as const)
    if (input[key] !== undefined) result[key] = input[key]
  if (input.imageUrl !== undefined) result.imageUrl = isImageLocation(input.imageUrl) ? input.imageUrl : null
  if (input.imageUrls !== undefined) result.imageUrls = input.imageUrls
  return JSON.stringify(result)
}
export const listingsApi = {
  listPage: async (search = '', filters: ListingFilters = {}): Promise<ListingPage> => {
    if (filters.ids && !filters.ids.length) return { items: [], total: 0, pages: 0 }
    const query = new URLSearchParams({
      search,
      page: String(filters.page || 1),
      size: String(filters.size || 9),
    })
    for (const key of ['city', 'kind', 'maxPrice', 'petFriendly', 'sort'] as const)
      if (filters[key] !== undefined && filters[key] !== '') query.set(key, String(filters[key]))
    filters.ids?.forEach((id) => query.append('ids', String(id)))
    const page = await apiRequest<{ items: ServerListing[]; total: number; pages: number }>(
      (filters.favorites
        ? '/users/me/favorites/listings'
        : filters.mine
          ? '/users/me/listings'
          : '/listings') +
        '?' +
        query,
    )
    return { ...page, items: page.items.map(toListing) }
  },
  get: async (id: number) => toListing(await apiRequest<ServerListing>('/listings/' + id)),
  create: async (input: NewListing) =>
    toListing(await apiRequest<ServerListing>('/listings', { method: 'POST', body: body(input) })),
  update: async (id: number, changes: Partial<NewListing>) =>
    toListing(await apiRequest<ServerListing>('/listings/' + id, { method: 'PATCH', body: body(changes) })),
  remove: (id: number) => apiRequest<void>('/listings/' + id, { method: 'DELETE' }),
}
