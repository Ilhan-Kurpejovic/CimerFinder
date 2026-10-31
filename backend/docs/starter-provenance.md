# Starter provenance

Source: https://github.com/PavleDz/ai-dev-backend (main, commit 3f2a4a13d61a6cab0f97756a5f93c220edd02476).

Retained the package dependencies and poetry.lock unchanged, domain-layer organization, shared database/session code, JWT/password approach, API errors, CLI and test conventions. The games/listings example and its sample-data tests were not imported because this phase only implements identity and profiles. A new initial migration was generated from CimerFinder's User model; no upstream migration history was rewritten. The app title and current-user payload were adapted to CimerFinder. Integration tests only target temporary databases.

This project keeps frontend and backend in one repository. The source starter's separate-repository convention is superseded by the existing monorepo layout; the root docs/entities.md describes frontend mock behavior and links to the implemented backend contract.

Verified locally: 44 tests passed; Ruff/Black, strict mypy (49 files), fresh migrations and alembic check passed. The development seed is idempotent. Live HTTP checks passed for /live, /ready, login, authenticated profile and OpenAPI. Poetry dependencies match the imported lock file byte-for-byte. PostgreSQL and frontend integration were not tested in phase one.

## Connected application verification

Phase two adds listing CRUD/search/pagination, own listings and real frontend API integration. Verified: 83 backend tests, strict mypy (59 source files), Ruff/Black, Alembic consistency and frontend production build/lint. The real frontend-adapter integration check uses Vite proxying and a temporary SQLite database; it restarts both server processes, verifies persisted profile/listing edits and checks ownership and invalid-token handling. The existing local database was upgraded and the seed was run twice without overwriting existing records. Browser visual QA and PostgreSQL execution were unavailable and are not claimed. The imported Poetry lock remains unchanged.
