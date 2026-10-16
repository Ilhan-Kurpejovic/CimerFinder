---
paths:
  - "src/features/**"
---

# Feature-i

- Feature `src/features/<ime>/` ima samo podfoldere koji mu trebaju: `api/`, `components/`, `hooks/`, `types.ts`
- Feature ne uvozi iz drugog feature-a (ni preko `@/features/...`, ni relativnom putanjom)
- Feature ne uvozi iz `src/app`; ruta koristi feature, nikad obrnuto
- Smije da uvozi iz `src/components`, `src/lib` i iz sopstvenog foldera (relativno, npr. `../api/use-oglasi`)
- Ako dva feature-a trebaju isti kod, premjesti ga u `src/lib` ili `src/components`, a feature-e spoji u ruti u `src/app/routes`
- Bez barrel `index.ts` fajlova: uvozi se direktno fajl koji treba
- `npm run lint` provjerava granice
