# AI-DEV 2026 · Radionica 3 · Frontend starter

React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui, pripremljen za rad sa Claude Code-om.

## Pokretanje

Za tim: na GitHubu kliknite **Use this template** i napravite svoj repozitorijum, pa ga klonirajte.

Kurs koristi [pnpm](https://pnpm.io). Instalirajte ga jednom, pa pokrenite projekat:

```bash
npm install -g pnpm   # jednom po računaru
pnpm install
pnpm dev              # http://localhost:5173
pnpm lint             # oxlint + provjera granica između feature-a
```

Radi i sa npm-om (`npm install`, `npm run dev`), ali na kursu koristimo pnpm i u repozitorijumu je samo `pnpm-lock.yaml`.

Otvorite folder u VS Code-u i pokrenite Claude Code ekstenziju.

## Struktura (feature-first)

```
src/
  app/            router.tsx, providers.tsx i routes/ (jedan fajl po ruti)
  features/<ime>/ api/, components/, types.ts jedne funkcionalnosti (primjer: oglasi)
  components/     ui/ (shadcn) i layout/
  lib/            utils.ts i mock-db.ts
```

Feature-i ne uvoze jedan drugog, a ruta ih spaja. `pnpm lint` provjerava i te granice
(`scripts/check-boundaries.mjs`) i javlja tačan fajl i import koji ih krši.

## Prvi koraci sa Claude-om

1. „Ispitaj me o dizajnu naše aplikacije, jedno po jedno pitanje, pa popuni DESIGN.md i ažuriraj tokene u src/index.css.“
2. Dopunite prvu rečenicu u CLAUDE.md temom vaše aplikacije.
3. `/novi-feature <ime>: <opis>` za svaku funkcionalnost vaše aplikacije, pa obrišite primjer `src/features/oglasi`.
4. `/nova-stranica` za svaki ekran: početna, lista, detalj, forma, prijava.
5. `/provjeri` i `ui-recenzent` prije svakog commita.

## Šta je u .claude folderu

| Fajl | Čemu služi |
| --- | --- |
| `CLAUDE.md` | Stack, komande, feature-first struktura, pravila, „gotovo je kad“ |
| `DESIGN.md` | Vizuelni identitet koji agent čita prije UI izmjena |
| `.claude/rules/` | Pravila koja se učitaju samo za određene fajlove (podaci, komponente, stilovi, feature-i) |
| `.claude/commands/` | `/nova-stranica`, `/novi-feature`, `/provjeri` |
| `.claude/skills/design-system/` | Dizajn pravila koja se učitaju kad se radi UI |
| `.claude/agents/ui-recenzent.md` | Subagent koji pregleda UI i ništa ne mijenja |
| `.claude/settings.json` | Dozvole, Explanatory stil odgovora i hook koji formatira svaki izmijenjen fajl |
| `.mcp.json` | Playwright (browser), shadcn (katalog komponenti) i Context7 (aktuelna dokumentacija biblioteka) |

MCP serveri u `.mcp.json` se pokreću sa `npx`, jer `npx` dolazi uz Node i radi bez obzira na to koji package manager koristite.

Preporučeno: `/plugin install frontend-design@claude-plugins-official`
