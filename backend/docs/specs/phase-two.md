# Phase two: real listings and frontend integration

Implement room/roommate listing CRUD, owner-only writes, server filtering and pagination, private personal listings, a forward-only Alembic migration, and the existing React UI connected to real auth/profile/listing APIs. Keep the starter's domain layering, transaction boundary, Poetry lock, and error contract. Owner identity is always taken from the token. Public author data excludes email and password fields.

Frontend registration/login validates real credentials, uses a tab-scoped JWT session, restores the current profile through /auth/me, and handles expiry and server outages. Vite proxies /api to FastAPI. Existing mock localStorage data is left untouched but is not silently imported or trusted as a real account. New local favorites use a separate account-specific key. Favorites and messages are not backend features in this phase.

Use HTTP(S) photo URLs temporarily; do not send base64 images into the database or silently pretend an upload succeeded. Profile and room photo controls explain this. Persist data in SQLite; verify through migrations, API tests and a real frontend-proxy/API integration check which restarts both servers on the same temporary database.
