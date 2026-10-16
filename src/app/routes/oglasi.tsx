import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { OglasiLista } from '@/features/oglasi/components/oglasi-lista'

export function Oglasi() {
  const [pretraga, setPretraga] = useState('')

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

      <OglasiLista pretraga={pretraga} />
    </section>
  )
}
