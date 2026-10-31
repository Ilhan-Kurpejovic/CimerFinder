# CimerFinder — connected frontend and backend

The active API contract is [backend/docs/entities.md](../backend/docs/entities.md). Authentication, profiles and listings now use real HTTP requests and the SQL database; no mock profile or listing store is used by the UI. Frontend adapters map integer ownerId to userId (string for existing component compatibility), displayName to name and avatarUrl to avatar. Public listing authors never include email or password fields.

Signed-in favorites use the SQL favorites table through /api/users/me/favorites; guest favorites remain in the browser. Existing account-local favorites are retained in browser storage but are not automatically imported. Private chat is available through /api/conversations. Real profile and listing photo uploads are implemented: one avatar and up to eight ordered listing photos, with the first used as the cover. Image bytes live in backend/data/uploads and SQL stores ownership, metadata and references. Existing external HTTP(S) URLs remain supported; empty images use a local placeholder. Old browser mock data is retained but not automatically imported or trusted as authentication.

Listing status is stored in SQL: active, paused or matched. Owners change it in Moji oglasi; public search includes only active listings, while personal lists retain all statuses.

## Historical mock implementation (superseded)

The notes below describe the earlier mock version and are retained for migration context. They are not the active persistence or authentication contract.

﻿# Entities

## Listing

Code: frontend/src/features/listings/types.ts and api/listings-api.ts.

| Field | Type | Meaning |
| --- | --- | --- |
| id | number | Generated identifier |
| userId | string, optional only for legacy/seed data | Owner profile ID; mandatory for newly created listings |
| authorBio | string, optional | Current profile biography projected when reading a listing |
| kind | room or roommate | Room listing or person seeking a shared home |
| title | string | Headline, 8 to 90 characters in the form |
| description | string | Room, habits and expectations, 40 to 3000 characters |
| price | number | Monthly rent or budget, 1 to 5000 EUR |
| city | string | Selected Serbian city |
| neighborhood | string | Neighborhood or preferred area |
| imageUrl | string | Photo URL or uploaded data URL |
| area | number | Room size or preferred size, 1 to 500 square meters |
| roommates | number | Number of roommates, 1 to 10 |
| name | string | Person posting the listing |
| age | number | 18 to 100 |
| occupation | string | Job or field of study |
| avatar | string | Illustrative profile photo |
| tags | string array | Amenities or lifestyle preferences |
| createdAt | ISO date string | Publication date |

Mock API exposes list(search), get(id), create(input), update(id, changes), remove(id), with simulated latency. Hooks use TanStack Query and invalidate listing queries after creation. Missing IDs reject with NotFoundError. The mock list is persisted in cimer-listings localStorage; no server requests are made. Future REST equivalents: GET /listings?search=, GET /listings/:id, POST /listings, PATCH /listings/:id, DELETE /listings/:id.

## User profile and ownership

`UserProfile` is shared in `frontend/src/lib/profile-store.ts` because listings, authentication and users all need it. The users feature exposes the type in `features/users/types.ts`; `api/users-api.ts` supplies `getCurrent` and `updateCurrent`, with a TanStack mutation hook invalidating listing queries after updates.

| Field | Type | Meaning |
| --- | --- | --- |
| id | string | Normalized email used as a stable local demo identifier |
| email | string | Sign-in identifier, read-only in the profile editor |
| name | string | Display name, 2 to 60 characters |
| age | number or null | Unset for a new profile; editor requires an integer from 18 to 100 |
| occupation | string | Job or study field, required before publishing |
| city | string | Optional city, independent of a listing's location |
| bio | string | Optional public biography, up to 1,000 characters |
| avatar | string | Uploaded JPEG/PNG/WebP data URL (up to 2 MB) or local placeholder |

Profiles live in `cimer-profiles`. A normalized email reopens the same profile and its listings after logout/login. Existing demo sessions are migrated by email without claiming any old listings. The relationship is one user to many listings via `userId`. New publication requires sign-in and a completed name, age and occupation; the mock API supplies the owner and author fields from the active profile rather than trusting form-supplied ownership.

Reads project the latest name, age, occupation, avatar and biography from the owner profile. For `roommate` listings, the main photo also comes from the profile. For `room` listings, the property photo and location remain independent. Profile updates invalidate cached listing reads, and browser storage events refresh open lists/details. The profile page shows only listings whose userId matches the active profile. Seed and older saved listings without userId remain visible publicly but are not assigned to a user based on a matching name. Mock update/remove methods reject changes to another account's listings. This is demo behavior, not server-enforced authorization.

Future backend equivalents: GET /users/me, PATCH /users/me and GET /users/me/listings, with server-derived identity, ownership checks and image storage.

The personal listings section offers deletion only on the active user's cards. A native modal asks for confirmation and keeps cancellation as the initially focused action. The delete mutation disables duplicate submissions, reports errors without removing the card, and invalidates all listing queries on success so public lists, details and favorites reflect the deletion. Persistence happens before success; a failed storage write preserves the listing.

## Demo session and favorites

cimer-user stores the active profile identity. Demo login validates an email and a six-character minimum password, then discards the password. It provides no real security: anyone can enter an email in this local demo. Publishing requires a signed-in, completed profile. Logout clears the active session while retaining profiles and their listings on this device.

cimer-saved stores an array of listing IDs, shared across header, cards, details and the favorites route using a local external-store hook.

Contact messages are validated and acknowledged in the modal but never sent or stored. There is no messaging service, backend, payment flow or real account system.

## Listing editor

The /listings/:id/edit route loads existing data and checks the active owner before displaying the shared publishing/editor form. The update hook invalidates all listing queries after a successful mock update. Editable fields are kind, title, city, neighborhood, price, area, roommates, description, tags and imageUrl. The ID, creation date and ownership remain intact. Author information continues to come from the profile. A failed storage write preserves the previous listing. A room photo is retained when no new file is chosen; roommate photos continue to come from the profile.

## Backend implementation status — phase one

The sections above describe current frontend mock behavior. A real authentication/profile backend is now implemented in backend/. Its exact contract is backend/docs/entities.md: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me, GET /api/users/me and PATCH /api/users/me. Server IDs are integers and the server uses displayName/avatarUrl, so frontend integration needs an adapter for the existing name/avatar fields. Listings and favorites remain mock-only and are not server entities yet. No automatic import of browser-local users, passwords or listings is performed.
