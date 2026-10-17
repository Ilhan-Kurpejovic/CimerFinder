import { NotFoundError, delay } from '@/lib/mock-db'
import type { Listing, NewListing } from '../types'
import { currentProfile, defaultAvatar, profileComplete, readProfiles } from '@/lib/profile-store'
const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=85`
const initial: Listing[] = [
  {
    id: 1,
    title: 'Tvoj mirni kutak na Vračaru',
    city: 'Beograd',
    neighborhood: 'Vračar',
    price: 280,
    area: 18,
    roommates: 2,
    name: 'Milica',
    age: 24,
    occupation: 'Grafička dizajnerka',
    avatar: 'https://i.pravatar.cc/100?img=47',
    tags: ['Namešteno', 'Pet friendly', 'Terasa'],
    kind: 'room',
    imageUrl: photo('photo-1616486338812-3dadae4b4ace'),
    description:
      'Izdajemo svetlu, potpuno nameštenu sobu u prostranom stanu na Vračaru. Stan ima zajednički dnevni boravak, opremljenu kuhinju i terasu za jutarnju kafu. Blizu su prevoz, market i omiljene gradske kafeterije. Tražimo urednu i opuštenu osobu koja voli da ima svoj mir, ali i povremeno zajedničko druženje. Internet je uključen, a ostale račune delimo ravnopravno.',
    createdAt: '2026-10-16',
  },
  {
    id: 2,
    title: 'Svetla soba, dobra energija',
    city: 'Novi Sad',
    neighborhood: 'Grbavica',
    price: 220,
    area: 16,
    roommates: 1,
    name: 'Nikola',
    age: 26,
    occupation: 'Softverski inženjer',
    avatar: 'https://i.pravatar.cc/100?img=12',
    tags: ['Namešteno', 'Rad od kuće', 'Wi-Fi'],
    kind: 'room',
    imageUrl: photo('photo-1615874694520-474822394e73'),
    description:
      'Tražim cimera ili cimerku za udoban stan na Grbavici. Soba je svetla i ima radni sto, veliki orman i udoban krevet. U stanu je mirno tokom radnog vremena. Vikendom volimo filmove i kuvanje. Useljenje je moguće odmah, depozit je jedna mesečna kirija.',
    createdAt: '2026-10-15',
  },
  {
    id: 3,
    title: 'Dom sa pogledom na zelenilo',
    city: 'Beograd',
    neighborhood: 'Novi Beograd',
    price: 300,
    area: 22,
    roommates: 2,
    name: 'Ana',
    age: 23,
    occupation: 'Studentkinja arhitekture',
    avatar: 'https://i.pravatar.cc/100?img=44',
    tags: ['Terasa', 'Blizu fakulteta', 'Wi-Fi'],
    kind: 'room',
    imageUrl: photo('photo-1616486029423-aaa4789e8c9a'),
    description:
      'Prostrana soba u stanu pored parka. Imamo mnogo prirodnog svetla, biljaka i dovoljno prostora za učenje i odmor. Dobra povezanost sa centrom i fakultetima. Tražimo osobu koja poštuje zajednički prostor i voli prijatnu kućnu atmosferu.',
    createdAt: '2026-10-14',
  },
  {
    id: 4,
    title: 'Mali stan za veliko druženje',
    city: 'Niš',
    neighborhood: 'Centar',
    price: 160,
    area: 15,
    roommates: 1,
    name: 'Luka',
    age: 25,
    occupation: 'Student medicine',
    avatar: 'https://i.pravatar.cc/100?img=13',
    tags: ['Namešteno', 'Blizu fakulteta'],
    kind: 'room',
    imageUrl: photo('photo-1600210492486-724fe5c67fb0'),
    description:
      'Slobodna soba u urednom stanu u centru Niša. Sve je na nekoliko minuta peške. Opremljena kuhinja, veš mašina i brz internet. Računi se dele na dve osobe.',
    createdAt: '2026-10-13',
  },
  {
    id: 5,
    title: 'Tražim dom i dobrog cimera',
    city: 'Beograd',
    neighborhood: 'Vračar ili Zvezdara',
    price: 300,
    area: 0,
    roommates: 1,
    name: 'Sara',
    age: 24,
    occupation: 'Marketing menadžerka',
    avatar: 'https://i.pravatar.cc/300?img=49',
    tags: ['Ne pušim', 'Volim životinje', 'Uredna'],
    kind: 'roommate',
    imageUrl: 'https://i.pravatar.cc/600?img=49',
    description:
      'Selim se u Beograd zbog posla i tražim prijatan stan i osobu sa kojom bih ga delila. Volim jutarnju kafu, knjige i šetnje. Radim iz kancelarije, poštujem tuđi prostor i dogovore. Budžet mi je do 300 € za kiriju.',
    createdAt: '2026-10-12',
  },
  {
    id: 6,
    title: 'Cimer za novi početak u Novom Sadu',
    city: 'Novi Sad',
    neighborhood: 'Limani ili Grbavica',
    price: 250,
    area: 0,
    roommates: 1,
    name: 'Marko',
    age: 27,
    occupation: 'Frontend developer',
    avatar: 'https://i.pravatar.cc/300?img=11',
    tags: ['Rad od kuće', 'Ne pušim', 'Društven'],
    kind: 'roommate',
    imageUrl: 'https://i.pravatar.cc/600?img=11',
    description:
      'Tražim cimera za zajednički pronalazak stana. Radim od kuće, volim sport i kuvanje. Važni su mi urednost i otvorena komunikacija. Voleo bih da stan ima odvojene sobe i dobar internet.',
    createdAt: '2026-10-11',
  },
]
function load(): Listing[] {
  try {
    const data = JSON.parse(localStorage.getItem('cimer-listings') || 'null')
    return Array.isArray(data) ? data : initial
  } catch {
    return initial
  }
}
function persist(listings: Listing[]) {
  localStorage.setItem('cimer-listings', JSON.stringify(listings))
}
function withAuthor(item: Listing): Listing {
  const user = readProfiles().find((profile) => profile.id === item.userId)
  return user
    ? {
        ...item,
        name: user.name,
        age: user.age ?? item.age,
        occupation: user.occupation,
        avatar: user.avatar,
        authorBio: user.bio,
        imageUrl: item.kind === 'roommate' ? user.avatar : item.imageUrl,
      }
    : item
}
export const listingsApi = {
  list: (search = '') =>
    delay(
      load()
        .map(withAuthor)
        .filter((l) =>
          `${l.title} ${l.city} ${l.neighborhood} ${l.name}`
            .toLocaleLowerCase('sr')
            .includes(search.toLocaleLowerCase('sr')),
        ),
    ),
  get: (id: number) => {
    const item = load().find((l) => l.id === id)
    return item ? delay(withAuthor(item)) : Promise.reject(new NotFoundError('Listing', id))
  },
  create: (input: NewListing) => {
    const user = currentProfile()
    if (!profileComplete(user))
      return Promise.reject(new Error('Prijavi se i dopuni profil pre objavljivanja.'))
    const item: Listing = {
      ...input,
      userId: user.id,
      name: user.name,
      age: user.age,
      occupation: user.occupation,
      // Store profile photos once; reads resolve them through userId.
      avatar: defaultAvatar,
      imageUrl: input.kind === 'roommate' ? defaultAvatar : input.imageUrl,
      id: Date.now(),
      createdAt: new Date().toISOString().slice(0, 10),
    }
    persist([item, ...load()])
    return delay(withAuthor(item))
  },
  update: (id: number, changes: Partial<NewListing>) => {
    const existing = load().find((l) => l.id === id)
    if (!existing) return Promise.reject(new NotFoundError('Listing', id))
    if (!existing.userId || existing.userId !== currentProfile()?.id)
      return Promise.reject(new Error('Možeš menjati samo svoje oglase.'))
    persist(load().map((l) => (l.id === id ? { ...l, ...changes, userId: l.userId } : l)))
    return listingsApi.get(id)
  },
  remove: (id: number) => {
    const existing = load().find((l) => l.id === id)
    if (!existing) return Promise.reject(new NotFoundError('Listing', id))
    if (!existing.userId || existing.userId !== currentProfile()?.id)
      return Promise.reject(new Error('Možeš brisati samo svoje oglase.'))
    persist(load().filter((l) => l.id !== id))
    return delay(undefined)
  },
}
