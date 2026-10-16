# [Naziv aplikacije]: frontend

[Jedna rečenica: šta aplikacija radi i za koga.]

React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui + React Router + TanStack Query.
Dizajn je opisan u @DESIGN.md, entiteti u @docs/entiteti.md.

## Komande
- `npm run dev`: dev server na http://localhost:5173
- `npm run typecheck`: TypeScript provjera
- `npm run lint`: oxlint
- `npm run build`: produkcijski build

## Struktura
- `src/types/`: tipovi entiteta, jedan fajl po entitetu
- `src/api/`: jedino mjesto koje dohvata podatke (trenutno mock iz `mock-db.ts`)
- `src/hooks/`: TanStack Query hookovi oko `src/api/`
- `src/components/ui/`: shadcn/ui komponente, dodaju se sa `npx shadcn@latest add <ime>`
- `src/components/<oblast>/`: komponente jedne oblasti (npr. `oglasi/`)
- `src/pages/`: jedna stranica = jedna ruta, rute su u `src/router.tsx`

## Pravila
- Komponente i stranice nikad ne zovu `src/api/` direktno, nego kroz hook iz `src/hooks/`
- Prvo postojeća komponenta iz `src/components/ui`, tek onda nova
- Boje, fontovi i radius samo iz tokena u `src/index.css`, bez hex vrijednosti u komponentama
- Svaka lista i stranica sa podacima ima loading, empty i error stanje
- Sav tekst za korisnika je na crnogorskom
- Bez `any` i bez `!` (non-null assertion)

## Gotovo je kad
- `npm run typecheck` i `npm run lint` prolaze
- Stranica je otvorena preko Playwright MCP-a i screenshot na 375 px i 1440 px izgleda kao DESIGN.md
- Nema grešaka u browser konzoli
