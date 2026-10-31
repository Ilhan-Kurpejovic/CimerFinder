# Phase one: persistent identity and profiles

Authorized scope: bootstrap the supplied FastAPI/SQLAlchemy/Poetry architecture inside the existing backend directory. Provide SQLite through Alembic, JWT register/login/me, and authenticated profile read/update. Keep the frontend in mock mode until a later integration phase. Do not import the starter's games-marketplace example domain.

User IDs become database-assigned integers, independent of email. Authentication returns token and user, including displayName and profile fields. Passwords are bcrypt hashes, never response data. Profile updates derive identity from the token, never the request body. Preserve all frontend browser-local data.

Use the starter's domain api/services/repositories/models/schemas/exceptions/routes structure, Protocols, kink DI, camelCase JSON, uniform errors and one transaction per endpoint. SQLite is the verified local target; PostgreSQL support is inherited but not verified in this phase. File uploads, favorites, listings and frontend API wiring are later phases. Profile avatarUrl currently stores an optional external HTTP(S) URL only.

Validation: lint, strict mypy, unit and integration tests on a temporary database, migration consistency, live HTTP health/auth/profile checks, idempotent local seed. Test setup always uses its own temporary database, never an externally configured development database.
