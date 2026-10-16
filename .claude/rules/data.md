---
paths:
  - "src/api/**/*.ts"
  - "src/hooks/**/*.ts"
  - "src/types/**/*.ts"
---

# Podaci

- Tipovi entiteta su u `src/types/`, i svaka promjena tipa ide i u `docs/entiteti.md`
- `src/api/<entitet>.ts` izlaže `list`, `get`, `create`, `update`, `remove`, iste kao budući REST API
- Mock podaci izgledaju realno (pravi nazivi, gradovi, cijene), bez „Lorem ipsum“
- Hook za čitanje koristi `useQuery`, hook za izmjenu `useMutation` i poslije uspjeha poziva `invalidateQueries`
- Ključevi keša: `[entitet]`, `[entitet, id]`, `[entitet, filter]`
