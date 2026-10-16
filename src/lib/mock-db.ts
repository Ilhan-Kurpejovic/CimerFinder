// Mock "baza" u memoriji, zajednička za sve feature-e. Sljedeće subote ovaj fajl nestaje,
// a funkcije u src/features/<ime>/api/ počinju da zovu pravi backend.

const KASNJENJE_MS = 400

export const sacekaj = <T>(vrijednost: T) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(vrijednost), KASNJENJE_MS))

export class NijePronadjenoError extends Error {
  constructor(resurs: string, id: number) {
    super(`${resurs} sa id ${id} ne postoji`)
  }
}
