import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useOglasi } from '@/hooks/use-oglasi'

export function Oglasi() {
  const [pretraga, setPretraga] = useState('')
  const { data: oglasi, isLoading, error } = useOglasi(pretraga)

  return (
    <section>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h1 className="text-3xl font-bold">Oglasi</h1>
        <Input
          aria-label="Pretraga oglasa"
          placeholder="Pretraži po nazivu"
          value={pretraga}
          onChange={(e) => setPretraga(e.target.value)}
          className="md:max-w-xs"
        />
      </div>

      {isLoading && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      )}

      {error && <p className="mt-8 text-destructive">Oglasi se nisu učitali. Pokušajte ponovo.</p>}

      {oglasi?.length === 0 && <p className="mt-8 text-muted-foreground">Nema oglasa za „{pretraga}“.</p>}

      {oglasi && oglasi.length > 0 && (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {oglasi.map((oglas) => (
            <li key={oglas.id}>
              <Card className="overflow-hidden pt-0">
                <img src={oglas.slikaUrl} alt={oglas.naziv} className="aspect-[3/2] w-full bg-muted object-cover" />
                <CardHeader>
                  <Badge variant="secondary">{oglas.kategorija}</Badge>
                  <CardTitle className="text-lg">{oglas.naziv}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between text-sm">
                  <span className="text-lg font-semibold">{oglas.cijena} €</span>
                  <span className="text-muted-foreground">{oglas.grad}</span>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
