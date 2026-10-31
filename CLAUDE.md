# CimerFinder

CimerFinder helps people find rooms and compatible roommates in Serbian cities. The React application is connected to FastAPI and SQLite for authentication, profiles, listings and photo uploads. Favorites are stored per account in SQL and private conversations and messages are stored in SQL.

This is a monorepo: one repository for the whole app.
- `frontend/`: React app (Workshop 3). Details in @frontend/CLAUDE.md
- `backend/`: FastAPI, SQLite/Alembic, JWT authentication, profiles and room/roommate listings; connected frontend
- `docs/entities.md`: entities and the API contract shared by frontend and backend

## Language
Code, identifiers, comments and docs are in English. Product UI copy is in Serbian Latin to match the supplied brief and branding.
You may talk to me in any language.

## Commands (run from the repo root)
- `pnpm install`: installs dependencies for every package in the workspace
- `pnpm dev`: frontend dev server at http://localhost:5173
- `pnpm typecheck`: TypeScript check
- `pnpm lint`: oxlint and the boundary check between features
- `pnpm build`: production build
- `pnpm format`: Prettier formats `frontend/src/`

## Working in the monorepo
- One change that touches frontend and backend goes in one commit or pull request
- When an entity changes, update `docs/entities.md` in the same change
- Run commands from the root; scripts are forwarded with `pnpm --filter <package>`
