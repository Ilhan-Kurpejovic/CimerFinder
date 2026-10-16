import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { Oglas } from '../types'

type OglasKarticaProps = {
  oglas: Oglas
}

export function OglasKartica({ oglas }: OglasKarticaProps) {
  return (
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
  )
}
