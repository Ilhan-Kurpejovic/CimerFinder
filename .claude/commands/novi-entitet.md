---
description: Novi entitet sa tipom, mock podacima, API funkcijama i hookovima
argument-hint: <naziv i kratak opis entiteta>
---

Dodaj entitet: $ARGUMENTS

1. Predloži polja, tipove i veze sa postojećim entitetima i sačekaj da potvrdim
2. Tip u src/types/<entitet>.ts
3. 8–12 realnih mock zapisa i funkcije list, get, create, update, remove u src/api/<entitet>.ts, po uzoru na src/api/oglasi.ts
4. Hookovi u src/hooks/use-<entitet>.ts
5. Dopuni docs/entiteti.md: tabela polja, veze, pravila pristupa i API koji frontend očekuje
6. Pokreni `npm run typecheck`
