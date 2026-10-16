// Primjer entiteta. Zamijenite ga entitetima svoje aplikacije (vidi docs/entiteti.md).
export type Oglas = {
  id: number
  naziv: string
  opis: string
  cijena: number
  kategorija: 'igre' | 'konzole' | 'oprema'
  grad: string
  slikaUrl: string
  kreirano: string
}

export type NoviOglas = Omit<Oglas, 'id' | 'kreirano'>
