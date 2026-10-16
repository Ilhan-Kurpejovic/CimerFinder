---
description: Novi feature sa tipom, mock podacima, API funkcijama i hookovima
argument-hint: <ime>: <opis>
---

Dodaj feature: $ARGUMENTS

Format je `<ime>: <opis>`, npr. `korisnici: prodavci koji objavljuju oglase`. Ime je u množini i kebab-case.

1. Pročitaj CLAUDE.md, docs/entiteti.md i `src/features/oglasi/` kao uzor
2. Predloži polja, tipove i veze sa postojećim entitetima i sačekaj da potvrdim
3. Tip u `src/features/<ime>/types.ts`
4. 8–12 realnih mock zapisa na crnogorskom (prava imena, gradovi, cijene, bez „Lorem ipsum“) i funkcije `list`, `get`, `create`, `update`, `remove` u `src/features/<ime>/api/<ime>-api.ts`, po uzoru na `src/features/oglasi/api/oglasi-api.ts`, uz `sacekaj` i `NijePronadjenoError` iz `@/lib/mock-db`
5. Hookovi u `src/features/<ime>/api/use-<ime>.ts`
6. Komponente (ako trebaju) u `src/features/<ime>/components/`, sa loading, empty i error stanjem
7. Dopuni docs/entiteti.md: tabela polja, veze, pravila pristupa i API koji frontend očekuje
8. Ne diraj druge feature-e i ne uvozi iz njih; ako nešto treba da se dijeli, pitaj me prije nego što ga premjestiš u `src/lib`
9. Pokreni `npm run typecheck` i `npm run lint`
