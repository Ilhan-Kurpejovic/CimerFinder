# [Naziv aplikacije]: frontend

[Jedna rečenica: šta aplikacija radi i za koga.]

React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui + React Router + TanStack Query.
Dizajn je opisan u @DESIGN.md, entiteti u @docs/entiteti.md.

## Komande
- `pnpm dev`: dev server na http://localhost:5173
- `pnpm typecheck`: TypeScript provjera
- `pnpm lint`: oxlint i provjera granica između feature-a
- `pnpm build`: produkcijski build
- `pnpm format`: Prettier formatira `src/`

## Feature-first
Svaka funkcionalnost (oglasi, korisnici, poruke…) živi u `src/features/<ime>/` i ima samo
podfoldere koji joj trebaju: `api/`, `components/`, `hooks/`, `types.ts`. Feature-i ne uvoze
jedan drugog; ruta u `src/app/routes/` ih spaja na jednoj stranici. Zajednički kod ide u
`src/components/ui` ili `src/lib`, i to tek kad ga koriste bar dva feature-a.
Smjer zavisnosti: zajednički kod -> features -> app, nikad obrnuto.

## Struktura
- `src/app/router.tsx`: sve rute; `src/app/providers.tsx`: globalni provideri (TanStack Query)
- `src/app/routes/`: jedan fajl po ruti, samo spaja feature-e i layout
- `src/features/<ime>/types.ts`: tipovi entiteta tog feature-a
- `src/features/<ime>/api/<ime>-api.ts`: jedino mjesto koje dohvata podatke (trenutno mock)
- `src/features/<ime>/api/use-<ime>.ts`: TanStack Query hookovi oko API-ja
- `src/features/<ime>/components/`: komponente tog feature-a (npr. `oglas-kartica.tsx`)
- `src/components/ui/`: shadcn/ui komponente, dodaju se sa `pnpm dlx shadcn@latest add <ime>`
- `src/components/layout/`: layout aplikacije (zaglavlje, navigacija)
- `src/lib/`: `utils.ts` (`cn`) i `mock-db.ts` (mock baza i kašnjenje)

## Pravila
- Feature ne uvozi drugi feature; `src/components` i `src/lib` ne uvoze iz `src/features` ni `src/app`
- Bez barrel `index.ts` fajlova: uvozi se direktno fajl (`@/features/oglasi/components/oglasi-lista`)
- Komponente i rute nikad ne zovu `*-api.ts` direktno, nego kroz hook iz `use-<ime>.ts`
- Prvo postojeća komponenta iz `src/components/ui`, tek onda nova
- Boje, fontovi i radius samo iz tokena u `src/index.css`, bez hex vrijednosti u komponentama
- Svaka lista i stranica sa podacima ima loading, empty i error stanje
- Sav tekst za korisnika je na crnogorskom
- Bez `any` i bez `!` (non-null assertion)
- Ako nisi siguran kako radi API neke biblioteke (Tailwind v4, React Router 8, TanStack Query 5), provjeri dokumentaciju preko Context7, ne pogađaj.

## Gotovo je kad
- `pnpm typecheck` i `pnpm lint` prolaze
- Stranica je otvorena preko Playwright MCP-a i screenshot na 375 px i 1440 px izgleda kao DESIGN.md
- Nema grešaka u browser konzoli
