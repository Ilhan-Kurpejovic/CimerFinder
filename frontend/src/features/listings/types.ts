export type Listing = {
  id: number
  userId?: string
  authorBio?: string
  title: string
  description: string
  price: number
  city: string
  neighborhood: string
  imageUrl: string
  createdAt: string
  area: number
  roommates: number
  name: string
  age: number
  occupation: string
  avatar: string
  tags: string[]
  kind: 'room' | 'roommate'
}
export type NewListing = Omit<Listing, 'id' | 'createdAt'>
