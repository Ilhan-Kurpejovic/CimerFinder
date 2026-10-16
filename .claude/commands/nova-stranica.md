---
description: Nova stranica sa rutom, stanjima i vizuelnom provjerom
argument-hint: <opis stranice>
---

Napravi stranicu: $ARGUMENTS

1. Pročitaj DESIGN.md, src/app/router.tsx, postojeće rute u src/app/routes/ i feature-e u src/features/
2. Ako ti nije jasno šta stranica treba da sadrži, prvo me pitaj (jedno pitanje odjednom)
3. Napravi kratak plan i sačekaj da ga odobrim
4. Stranica je fajl u src/app/routes/ koji samo spaja komponente feature-a i layout; podaci i komponente su u src/features/<ime>/ (ako feature ne postoji, predloži `/novi-feature`)
5. Koristi komponente iz src/components/ui, a nove dodaj sa `npx shadcn@latest add`
6. Dodaj loading, empty i error stanje
7. Registruj rutu u src/app/router.tsx i dodaj link u navigaciji (src/components/layout/app-layout.tsx) ako ima smisla
8. Pokreni `npm run typecheck` i `npm run lint`
9. Otvori stranicu preko Playwright MCP-a, napravi screenshot na 375 px i 1440 px, uporedi sa DESIGN.md i ispravi što ne valja
