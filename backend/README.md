# CimerFinder backend — connected application

FastAPI, Python 3.13, SQLAlchemy, Alembic, Poetry, PyJWT, bcrypt and kink, adapted from https://github.com/PavleDz/ai-dev-backend. The domain layout and request transaction handling follow the starter. SQLite is the current tested database; the inherited PostgreSQL configuration is available but unverified in this phase.

## Implemented

- Real registration, password verification and expiring JWT access tokens.
- Database-backed current user and editable profile.
- Room/roommate listing CRUD with owner-only changes, filters, pagination and personal listings.
- Authenticated profile/listing image uploads, ordered listing galleries, ownership checks and safe cleanup.
- Alembic schema migration, consistent camelCase JSON and error responses.
- Unit/integration tests isolated from development data, plus migration consistency checks.
- /live, /ready and interactive OpenAPI docs at /docs.

The React application now calls the real authentication, profile and listing APIs through its Vite proxy. Favorites are stored per account in SQL; password reset, email verification and server-side logout/revocation are later phases. Photo forms now upload files through /api/media and save the returned relative URLs; existing external image URLs still work.

## Setup

Run in the backend directory with Python 3.13 and Poetry installed:

    poetry install
    poetry run migrate
    poetry run seed
    poetry run start

The seed creates demo@example.com / demo1234 and three illustrative room/roommate listings only if they do not already exist. It never overwrites an existing account. This is a local demonstration account. The SQLite file is data/app.db and is ignored by Git. No frontend browser data is imported automatically.

This checkout also has a gitignored local Poetry installation in ../.backend-tools. Its executable is ../.backend-tools/Scripts/poetry.exe. The local backend environment is .venv. On this Windows machine the Store python alias is broken; use the actual installed Python 3.13 executable when setting up Poetry. To run without relying on the global alias after installation:

    .\.venv\Scripts\python.exe manage.py migrate
    .\.venv\Scripts\python.exe manage.py seed
    .\.venv\Scripts\python.exe manage.py runserver

Open http://127.0.0.1:8000/docs. Use POST /api/auth/login and copy the returned token into Swagger's Authorize field. GET and PATCH /api/users/me operate on the authenticated profile.

Settings read environment variables and optional .env. See .env.example. The default JWT key is for local development only; set a unique random JWT_SECRET_KEY before sharing or deploying. Access tokens expire after 60 minutes by default. There is no refresh-token or revocation endpoint; frontend logout discards its access token.

## Photo storage

POST /api/media accepts multipart file and purpose (avatar or listing) with a bearer token. Supported files: JPEG, PNG and WebP, up to 5 MiB, nonanimated and at most 25 million input pixels. Pillow validates, fixes orientation, removes metadata, scales to at most 2000 by 2000 and re-encodes WebP under a generated filename. GET /api/media/:key serves the processed image publicly. DELETE /api/media/:id removes only the current owner's unattached upload; referenced images return 409.

Save avatarUrl through PATCH /api/users/me, or imageUrls (at most eight, ordered, first is cover) through listing create/update. The server verifies ownership and purpose. Removing or replacing saved photos prunes files only after a successful SQL commit and only when no profile/listing still references them. A failed upload transaction removes its newly written file. The frontend attempts to discard unsaved uploads when cancelled or left; an interrupted/offline client can leave unused uploads, so scheduled orphan cleanup is future work.

The default UPLOAD_DIR is data/uploads, relative to the backend process directory. Image bytes are runtime files, not SQL blobs and not tracked in Git. Back up both data/app.db and data/uploads; both must be on persistent storage when deployed. Restarting the servers preserves both. Vite already proxies the /api/media path; a production reverse proxy must route /api to the backend too.

## Checks

    poetry run lint
    poetry run typecheck
    poetry run test
    poetry run alembic check

Tests always use temporary SQLite databases and never reuse an external DATABASE_URL. The migration test upgrades a fresh temporary database and checks it against the models. Do not change an applied migration; generate a new revision for schema changes.

## Layout

    app/auth/         api, schemas, services, repositories, exceptions and routes
    app/media/        owned image upload, decoding/storage, metadata and routes
    app/listings/     listing CRUD and ordered photo references
    app/users/        api, schemas, services, repositories, models, exceptions and routes
    app/database/     engine/session and one transaction per endpoint
    app/config/       environment-based settings
    app/utils/        DI, error schemas and shared helpers
    alembic/          database schema history
    tests/            unit and integration tests
    docs/entities.md  active API contract
    data/             ignored local database and uploaded image files

Frontend adapters map name/avatar to API displayName/avatarUrl. Server user IDs are integers; mock email-based IDs are not real accounts.
