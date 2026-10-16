---
description: Nova stranica sa rutom, stanjima i vizuelnom provjerom
argument-hint: <opis stranice>
---

Napravi stranicu: $ARGUMENTS

1. Pročitaj DESIGN.md, src/router.tsx i postojeće stranice u src/pages/
2. Ako ti nije jasno šta stranica treba da sadrži, prvo me pitaj (jedno pitanje odjednom)
3. Napravi kratak plan i sačekaj da ga odobrim
4. Podatke uzimaj kroz hook iz src/hooks/ (napravi ga ako ne postoji)
5. Koristi komponente iz src/components/ui, a nove dodaj sa `npx shadcn@latest add`
6. Dodaj loading, empty i error stanje
7. Dodaj rutu u src/router.tsx i link u navigaciji ako ima smisla
8. Pokreni `npm run typecheck` i `npm run lint`
9. Otvori stranicu preko Playwright MCP-a, napravi screenshot na 375 px i 1440 px, uporedi sa DESIGN.md i ispravi što ne valja
