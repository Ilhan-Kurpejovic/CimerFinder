// Mock "baza" u memoriji. Sljedeće subote ovaj fajl nestaje,
// a funkcije u src/api/ počinju da zovu pravi backend.

const KASNJENJE_MS = 400

export const sacekaj = <T>(vrijednost: T) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(vrijednost), KASNJENJE_MS))

export class NijePronadjenoError extends Error {
  constructor(resurs: string, id: number) {
    super(`${resurs} sa id ${id} ne postoji`)
  }
}
