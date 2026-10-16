import { Skeleton } from '@/components/ui/skeleton'

import { useOglasi } from '../api/use-oglasi'
import { OglasKartica } from './oglas-kartica'

type OglasiListaProps = {
  pretraga: string
}

// Lista oglasa sa sva tri stanja: učitavanje, prazno i greška.
export function OglasiLista({ pretraga }: OglasiListaProps) {
  const { data: oglasi, isLoading, error } = useOglasi(pretraga)

  if (isLoading) {
    return (
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-72" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="mt-8 text-destructive">Oglasi se nisu učitali. Pokušajte ponovo.</p>
  }

  if (!oglasi || oglasi.length === 0) {
    return <p className="mt-8 text-muted-foreground">Nema oglasa za „{pretraga}“.</p>
  }

  return (
    <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {oglasi.map((oglas) => (
        <li key={oglas.id}>
          <OglasKartica oglas={oglas} />
        </li>
      ))}
    </ul>
  )
}
