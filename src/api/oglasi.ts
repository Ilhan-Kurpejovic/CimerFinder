import type { NoviOglas, Oglas } from '@/types/oglas'
import { NijePronadjenoError, sacekaj } from './mock-db'

let oglasi: Oglas[] = [
  {
    id: 1,
    naziv: 'EA Sports FC 26 (PS5)',
    opis: 'Korišćena dva mjeseca, disk bez ogrebotina, originalna kutija.',
    cijena: 35,
    kategorija: 'igre',
    grad: 'Podgorica',
    slikaUrl: 'https://picsum.photos/seed/fc26/600/400',
    kreirano: '2026-10-12',
  },
  {
    id: 2,
    naziv: 'Nintendo Switch OLED',
    opis: 'Bijela verzija, dva džojkona i futrola.',
    cijena: 240,
    kategorija: 'konzole',
    grad: 'Nikšić',
    slikaUrl: 'https://picsum.photos/seed/switch/600/400',
    kreirano: '2026-10-10',
  },
  {
    id: 3,
    naziv: 'DualSense kontroler',
    opis: 'Ispravan, bez drifta. Plava boja.',
    cijena: 45,
    kategorija: 'oprema',
    grad: 'Budva',
    slikaUrl: 'https://picsum.photos/seed/dualsense/600/400',
    kreirano: '2026-10-08',
  },
]

export const oglasiApi = {
  list: (pretraga = '') =>
    sacekaj(oglasi.filter((o) => o.naziv.toLowerCase().includes(pretraga.toLowerCase()))),

  get: (id: number) => {
    const oglas = oglasi.find((o) => o.id === id)
    if (!oglas) return Promise.reject(new NijePronadjenoError('Oglas', id))
    return sacekaj(oglas)
  },

  create: (novi: NoviOglas) => {
    const oglas: Oglas = { ...novi, id: Date.now(), kreirano: new Date().toISOString().slice(0, 10) }
    oglasi = [oglas, ...oglasi]
    return sacekaj(oglas)
  },

  update: (id: number, izmjene: Partial<NoviOglas>) => {
    oglasi = oglasi.map((o) => (o.id === id ? { ...o, ...izmjene } : o))
    return oglasiApi.get(id)
  },

  remove: (id: number) => {
    oglasi = oglasi.filter((o) => o.id !== id)
    return sacekaj(undefined)
  },
}
