import { Link } from 'react-router'

export function NotFound() {
  return (
    <section className="py-16 text-center">
      <h1 className="text-3xl font-bold">Ova stranica još nema cimera.</h1>
      <Link to="/" className="mt-4 inline-block text-primary underline-offset-4 hover:underline">
        Nazad na početnu
      </Link>
    </section>
  )
}
