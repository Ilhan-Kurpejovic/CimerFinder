# CimerFinder — current connected application

The React UI now uses FastAPI and SQLite for real registration, login, profiles and room/roommate listing CRUD. Run both servers from the project root in separate terminals:

    cd backend
    .\.venv\Scripts\python.exe manage.py migrate
    .\.venv\Scripts\python.exe manage.py seed
    .\.venv\Scripts\python.exe manage.py runserver

In a second terminal at the project root:

    npm.cmd run dev

Open http://localhost:5173. The Vite dev server proxies /api to http://127.0.0.1:8000. Demo credentials after seeding are demo@example.com / demo1234; new users can register from the login page. Complete the profile before publishing. Change listing status in Moji oglasi (Aktivan, Pauziran, Pronađen cimer); public search shows active listings only. Data lives in backend/data/app.db and persists after restarting the servers. The database and environments are gitignored.

Profile and listing forms upload JPG, PNG and WebP files (up to 5 MB each) to the backend. Room listings support up to eight photos, cover selection and a gallery. Uploaded files live in backend/data/uploads; the database stores their metadata and paths. Back up both data/app.db and data/uploads together. Favorites are stored per signed-in account; private conversations and messages are stored in SQL. Old browser-local mock accounts and listings are preserved but are not automatically imported or accepted as real credentials. API tokens are tab-scoped; login again after closing the tab or token expiry.

Checks: npm.cmd run build, npm.cmd run lint, npm.cmd --prefix frontend run check:api; in backend use poetry run lint, poetry run typecheck, poetry run test and poetry run alembic check. The integration check uses an isolated temporary database, calls the actual frontend API adapters through Vite, restarts both servers and verifies saved profiles/listings and uploaded photo files. Production hosting must also route /api to the backend.

Chat: sign into two accounts in separate browsers (or normal/incognito windows). Open the other account's active listing and choose Javi se. Conversations appear in Poruke, with automatic 3–5 second updates and unread badges. Text persists in SQLite.

The earlier project notes are retained below as historical context; current behavior is described above and in backend/docs/entities.md.

---

﻿# CimerFinder

A room and roommate finder for Serbian cities, built on the supplied ai-frontend-starter monorepo. The UI is in Serbian Latin, with a lavender identity based on the supplied reference.

## Run locally

Node.js 22.12+ is required. From the repository root:

    npm --prefix frontend install
    npm run dev

Open http://localhost:5173. On Windows PowerShell, use npm.cmd if the execution policy blocks npm.ps1.

    npm run typecheck
    npm run lint
    npm run build

Production files are generated in frontend/dist. To preview a build, run npm --prefix frontend run preview. A static host must serve index.html for application routes such as /listings/1.

## Included

- Home page with room/roommate search, city and monthly budget.
- Room listings and roommate profiles with URL-based filters, keyword search, sorting and empty states.
- Listing details, persistent favorites and a simulated contact dialog.
- Validated publishing form with optional image upload and immediate detail-page navigation.
- Demo login with email and password validation, show/hide password and logout.
- Top-right account menu, editable profile with photo, name, age, occupation, city and biography, and a personal listings section.
- Delete your own listings from Moji oglasi, with a confirmation dialog, pending/error feedback and refreshed lists after deletion.
- New listings belong to the active profile and show updated author information automatically. Roommate listings use the profile photo; room photos remain independent.
- Responsive navigation and layouts, reduced-motion support, loading/error states.

## Stack and structure

React 19, Vite 8, Tailwind CSS 4, shadcn/ui, React Router, TanStack Query, React Hook Form, Zod and Lucide. The starter's TypeScript setup is retained.

    frontend/src/app/           Routing and page composition
    frontend/src/features/     Listings and demo authentication
    frontend/src/components/   Shared layout and shadcn/ui primitives
    frontend/src/lib/          Mock helpers and local state
    backend/                   FastAPI authentication and profiles (phase one)
    docs/entities.md           Data contract

## Demo behavior

The frontend is not yet connected to the backend and still uses demo authentication. No messages are sent. Any valid email and a password of at least six characters can be used for demo login. Passwords are never saved. Listings, favorite IDs, profiles and the active session are stored in this browser's localStorage. The same email restores the same local profile and its listings. Publishing requires a saved profile with name, age and occupation. Uploaded images are limited to 2 MB and stored as data URLs; browser storage capacity still applies. Clear the cimer-listings, cimer-saved, cimer-profiles and cimer-user keys in localStorage to reset the demo. Earlier listings without an owner are preserved but are not automatically claimed by a new account.

To try profiles: sign in, open the avatar menu at the top right, choose Moj profil, save your details and photo, then publish a listing. Return to Moji oglasi to see your own listings. Edit the profile and revisit the listing to check the updated author information. Log out and use a different email to try a separate local account.

Seed photography comes from Unsplash, profile images from Pravatar and fonts from Google Fonts. These assets require an internet connection and are illustrative.

## Verification

Type checking, the production build and lint/boundary checks are available through the commands above. Run npm --prefix frontend run check:mock for mock API checks. Browser screenshots and interactive visual QA were not available in the implementation session.

Own listings can be edited using Uredi oglas below each card in Moji oglasi. The prefilled form supports title, category, location, price, area, roommates, description, tags and photo changes. Saving updates the same listing and opens its details with confirmation; cancelling returns without saving.

## Backend phase one

A FastAPI backend now lives in backend/. Registration, JWT login and database-backed profile read/update are implemented and documented in backend/README.md. The React application remains in mock mode until the next integration phase. See backend/docs/entities.md for the current server API contract.
