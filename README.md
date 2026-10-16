# AI-DEV 2026 · Radionica 3 · Frontend starter

React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui, pripremljen za rad sa Claude Code-om.

## Pokretanje

```bash
npm install
npm run dev        # http://localhost:5173
```

Otvorite folder u VS Code-u i pokrenite Claude Code ekstenziju.

## Prvi koraci sa Claude-om

1. „Ispitaj me o dizajnu naše aplikacije, jedno po jedno pitanje, pa popuni DESIGN.md i ažuriraj tokene u src/index.css.“
2. Dopunite prvu rečenicu u CLAUDE.md temom vaše aplikacije.
3. `/novi-entitet` za svaki entitet vaše aplikacije, pa obrišite primjer `Oglas`.
4. `/nova-stranica` za svaki ekran: početna, lista, detalj, forma, prijava.
5. `/provjeri` i `ui-recenzent` prije svakog commita.

## Šta je u .claude folderu

| Fajl | Čemu služi |
| --- | --- |
| `CLAUDE.md` | Stack, komande, struktura, pravila, „gotovo je kad“ |
| `DESIGN.md` | Vizuelni identitet koji agent čita prije UI izmjena |
| `.claude/rules/` | Pravila koja se učitaju samo za određene fajlove |
| `.claude/commands/` | `/nova-stranica`, `/novi-entitet`, `/provjeri` |
| `.claude/skills/design-system/` | Dizajn pravila koja se učitaju kad se radi UI |
| `.claude/agents/ui-recenzent.md` | Subagent koji pregleda UI i ništa ne mijenja |
| `.claude/settings.json` | Dozvole i hook koji formatira svaki izmijenjen fajl |
| `.mcp.json` | Playwright (browser) i shadcn (katalog komponenti) |

Preporučeno: `/plugin install frontend-design@claude-plugins-official`
