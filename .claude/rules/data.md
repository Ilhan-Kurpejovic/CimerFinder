---
paths:
  - "src/features/**/api/**"
---

# Podaci

- Tipovi entiteta su u `src/features/<ime>/types.ts`, i svaka promjena tipa ide i u `docs/entiteti.md`
- `src/features/<ime>/api/<ime>-api.ts` izlaže `list`, `get`, `create`, `update`, `remove`, iste kao budući REST API
- Mock koristi `sacekaj` i `NijePronadjenoError` iz `@/lib/mock-db`; mock podaci tog feature-a ostaju u njegovom `api/` folderu
- Mock podaci izgledaju realno (pravi nazivi, gradovi, cijene), bez „Lorem ipsum“
- Hookovi su u `src/features/<ime>/api/use-<ime>.ts`: čitanje koristi `useQuery`, izmjena `useMutation` i poslije uspjeha poziva `invalidateQueries`
- Ključevi keša: `[entitet]`, `[entitet, id]`, `[entitet, filter]`
