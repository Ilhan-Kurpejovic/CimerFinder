import { Link } from 'react-router'

import { Button } from '@/components/ui/button'

export function Pocetna() {
  return (
    <section className="py-16">
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Starter za Radionicu 3</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Prazan React projekat spreman za rad sa Claude Code-om. Prvi korak: neka vas Claude ispita o dizajnu i
        napiše DESIGN.md.
      </p>
      <Button asChild className="mt-8">
        <Link to="/oglasi">Pogledaj primjer liste</Link>
      </Button>
    </section>
  )
}
