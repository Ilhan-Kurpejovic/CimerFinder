# CimerFinder API contract — authentication, listings and photo uploads

Base path /api. Request and response JSON use camelCase. IDs are database-assigned integers; dates are ISO 8601 UTC strings. Unknown input fields are rejected. Errors are {detail, code}, with fieldErrors for validation or conflicts. Validation messages are server-side English; the frontend maps error codes to its Ijekavian UI.

## User

| Field | Type | Rules |
| --- | --- | --- |
| id | integer | Assigned by the server, never editable |
| email | email string | Unique, normalized to lowercase, immutable in profile requests |
| displayName | string | 2–60 characters, trimmed, nonblank |
| age | integer or null | 18–100 when provided; nullable for an incomplete profile |
| occupation | string | At most 100 characters, defaults to empty |
| city | string | At most 80 characters, defaults to empty |
| bio | string | At most 1,000 characters, defaults to empty |
| avatarUrl | string or null | Owned avatar upload URL (/api/media/:key), or legacy HTTP(S) URL, up to 500 characters; null clears it |
| createdAt | UTC timestamp | Assigned by the database |

passwordHash is stored in the database but never returned. password is only accepted on registration/login. Registration requires 8–72 characters and at most 72 UTF-8 bytes. Login accepts 1–72 characters and at most 72 UTF-8 bytes. No password or account reset exists in phase one.

## Routes

| Method and path | Auth | Request | Response |
| --- | --- | --- | --- |
| POST /api/auth/register | Public | email, password, displayName | 201 {token, user} |
| POST /api/auth/login | Public | email, password | 200 {token, user} |
| GET /api/auth/me | Bearer token | None | 200 User |
| GET /api/users/me | Bearer token | None | 200 User |
| PATCH /api/users/me | Bearer token | Any subset of displayName, age, occupation, city, bio, avatarUrl | 200 updated User |
| GET /live | Public | None | 200 {status: ok} |
| GET /ready | Public | None | 200 {status: ok} after a database connection check |

A profile update uses identity from the token and cannot target another user. Omitted fields stay unchanged. Explicit null is allowed only for age and avatarUrl; text fields can be cleared with an empty string except displayName. Email, id, password and createdAt are not accepted in PATCH.

## Errors

- 401 not_authenticated: missing token; invalid_token: invalid, expired or unknown-user token; invalid_credentials: wrong email/password. Includes WWW-Authenticate: Bearer.
- 409 email_already_registered, with fieldErrors.email, for a duplicate normalized email.
- 422 validation_error, with fieldErrors, for invalid values or unknown input fields.
- 404 user_not_found if a profile no longer exists at the service boundary; unknown routes use http_error.
- 500 internal_error for unexpected server errors; no exception details are exposed.

## Listing

| Field | Type | Rules |
| --- | --- | --- |
| id, ownerId | integer | Assigned by server; ownership is derived from token |
| kind | room or roommate | Required |
| status | active, paused or matched | Defaults to active; owner can change with PATCH |
| title | string | Trimmed, 8–90 characters |
| description | string | Trimmed, 40–3000 characters |
| city, neighborhood | string | Trimmed, 2–80 and 2–100 characters |
| price | number | 1–5000 EUR, persisted to two decimal places |
| area | integer | 1–500 square metres |
| roommates | integer | 1–10 |
| tags | string array | At most 20 tags, each 1–50 characters |
| imageUrl | image location or null | First photo/cover; legacy single-photo input is supported |
| imageUrls | image location array | Up to eight ordered photos; first is cover, [] clears; duplicates are removed |
| createdAt | UTC timestamp | Preserved on edit |
| owner | public profile object | id, displayName, age, occupation, bio, avatarUrl only |

Roommate cards use owner.avatarUrl; room photographs remain separate from profile images. Reads load the current author profile. Publishing requires a completed age and occupation. A record's owner cannot be supplied or changed by a client. Explicit null on listing PATCH is accepted only for imageUrl. If imageUrls is supplied it takes precedence over imageUrl; omitted photos remain unchanged. Roommate listings discard room photos and use the current profile avatar. Other omitted fields remain unchanged.

| Method and path | Auth | Response |
| --- | --- | --- |
| GET /api/listings | Public | 200 {items, total, pages} |
| GET /api/listings/:id | Public | 200 Listing, or 404 listing_not_found |
| POST /api/listings | Signed in, complete profile | 201 Listing |
| PATCH /api/listings/:id | Owner only | 200 Listing |
| DELETE /api/listings/:id | Owner only | 204 with no body |
| GET /api/users/me/listings | Signed in | 200 paginated own listings |

List query parameters: search (up to 200 characters, Unicode casefold matching title/city/neighborhood), city (exact match), kind, maxPrice (0–5000), petFriendly (boolean; matches the Pet friendly tag), sort (newest or price), ids (optional repeated integer filter, up to 100), page (at least 1) and size (1–500). Default page size is 50. Newest sorts by createdAt then id descending; price sorts ascending with id descending as tie-breaker. Lists eagerly load author profiles rather than querying once per row. Personal listing queries always add the owner from the token.

Additional errors: 403 not_listing_owner, 404 listing_not_found, 400 profile_incomplete. Bad fields, nulls, ownerId injection, unsupported kinds and base64/file image URLs return 422 validation_error.

## Frontend and session integration

Vite proxies /api to FastAPI on 127.0.0.1:8000 by default (API_PROXY_TARGET can override the development target). A production host must route /api to the backend. The frontend maps API displayName/avatarUrl to its name/avatar view model and stringifies integer IDs for ownership comparisons.

The JWT is kept in tab-scoped sessionStorage, never in the old mock session. /api/auth/me restores the current profile; passwords are never saved. Logout discards the token and clears cached account data. An authenticated 401 also clears the token; a network outage does not. A new account or a closed browser tab may require a new login; SQL data remains persisted. Profile writes invalidate cached profiles and listings.

Favorites are stored in SQL per authenticated account. Guest selections remain browser-local. Private chat is implemented and stored in SQL. Refresh tokens and server-side logout/revocation remain future work. Old localStorage mock users/listings are untouched and are not automatically imported.


## Media and ordered listing photos

| Method and path | Auth | Request | Response |
| --- | --- | --- | --- |
| POST /api/media | Bearer token | multipart file, purpose=avatar or listing | 201 Media |
| GET /api/media/:key | Public | Generated storage key | 200 image/webp or 404 |
| DELETE /api/media/:id | Owner only | None | 204 if unattached, 409 if referenced |

Media JSON: id, url, purpose, byteSize, width, height. The URL is relative (/api/media/<uuid>.webp). SQL media rows additionally hold owner_id, storage_key and created_at; original filenames are never used as storage paths. User.avatar_media_id and ListingPhoto.media_id are internal foreign keys. ListingPhoto has listing_id, position (0 through 7), url and optional media_id (null for legacy external URLs), with a unique listing/position constraint. These internal IDs are not client-editable fields.

Uploads require authentication. JPEG, PNG and WebP only; max 5 MiB input, max 25 million input pixels, no animation. Files are decoded/verified and re-encoded to WebP, EXIF orientation corrected, metadata removed and dimensions capped at 2000 by 2000. Request bodies are bounded before multipart parsing. Generated basenames and path containment prevent client-controlled filesystem paths.

An uploaded avatar can be assigned only to its owner's profile, and a listing photo only to its owner's room listings. Absolute URLs using a managed /api/media path are checked and normalized too. Image locations otherwise accept HTTP(S) URLs for existing demo/external photos; data:, blob: and arbitrary local paths are rejected. Roommates show the latest owner avatar without copying or taking ownership of that image.

Additional errors: 403 not_media_owner, 404 media_not_found, 409 media_in_use, 413 image_too_large, 415 unsupported_image, 422 invalid_image or invalid_media_purpose, 500 image_storage_error. Malformed purpose/fields return 422 validation_error.

Attaching, replacing and removing references uses the endpoint transaction. Files removed from profiles/listings are deleted only after commit and only when unreferenced. Rollback preserves old files/references and removes a newly uploaded file if its metadata insert fails. Unattached uploads can be discarded by their owner; the frontend does this on cancel/navigation where possible. Abruptly closed/offline clients may leave orphan uploads; automatic expiry/cleanup is not implemented. Image content is public, as listing and profile photos are public.

Default storage: backend/data/uploads, configurable using UPLOAD_DIR. Back up the database and upload directory together. Neither file bytes nor database files belong in Git; deployments need persistent storage for both. The upload routes share the existing /api development proxy.


## Favorites

Favorite rows have id, user_id, listing_id and created_at (UTC). The user/listing pair is unique; deleting either parent cascades its favorites. Identity always comes from the bearer token.

| Method and path | Response |
| --- | --- |
| GET /api/users/me/favorites | 200 integer array of saved listing IDs |
| GET /api/users/me/favorites/listings | 200 paginated Listing page; same filters and sorting as public listings, intersected with the current user's favorites |
| PUT /api/users/me/favorites/:listingId | 204; idempotent, 404 listing_not_found if the listing does not exist |
| DELETE /api/users/me/favorites/:listingId | 204; idempotent, including an already removed listing |

All four routes require authentication (401 otherwise). Clients cannot supply a different user ID. A user's removal never changes another user's favorites. The frontend shares favorites through TanStack Query, refreshes lists after a change, disables saves while loading/pending and displays retryable failures. SQL favorites survive login from another device and server restarts. Guest favorites and older browser-local account selections are not automatically imported.


## Listing availability

Status is persisted as active, paused or matched (UI: Aktivan, Pauziran, Pronađen cimer). Create defaults to active, including migrated listings. PATCH rejects null or unknown statuses and uses the existing owner-only authorization. Public listing search and favorite listing pages include only active listings; personal listing pages retain all statuses. A direct detail URL remains readable and reports the actual status, with contact disabled in the UI for inactive listings. Pausing or completing a listing preserves photos, favorites, description and publication date; setting active makes it searchable again.


## Private chat

A conversation joins the listing owner and one interested user. SQL stores id, optional listing_id (SET NULL on listing deletion), listing_title snapshot, owner_id, guest_id, owner_read_id, guest_read_id, last_message_id, last_message, last_message_at and created_at. The listing/guest pair is unique. Participants must differ. Deleting a user cascades their conversations; deleting a listing preserves existing chat. Message rows contain id, conversation_id, sender_id, client_id (UUID), body and created_at, with a unique sender/client pair and a 1–2000 character body constraint. Client sender/participant IDs cannot be supplied.

All endpoints require a bearer token. Conversation access, history, sending and read acknowledgments are restricted to its two participants (403 not_conversation_participant). Unknown conversations return 404 conversation_not_found.

| Method and path | Request | Response |
| --- | --- | --- |
| GET /api/conversations | page, size | 200 {items, total, pages}; sorted by newest message |
| GET /api/conversations/unread-count | None | 200 {count}; unread incoming messages only |
| POST /api/conversations | listingId, body, clientId (UUID) | 201 Conversation; creates or reuses that listing/guest conversation and sends the first message |
| GET /api/conversations/:id | None | 200 Conversation |
| GET /api/conversations/:id/messages | size (1–100, default 50), optional beforeId | 200 {items, hasMore}; latest page, chronological within page |
| POST /api/conversations/:id/messages | body, clientId (UUID) | 201 Message |
| POST /api/conversations/:id/read | throughId | 204; acknowledges messages through an existing ID belonging to that conversation |

Conversation JSON: id, listingId (nullable), listingTitle, person ({id, displayName, avatarUrl}; the other participant, no email), lastMessage, lastMessageAt, unreadCount. Message JSON: id, senderId, body, createdAt. Repeating a message request with the same sender/clientId and identical content returns the original message without duplication; changing content/conversation returns 409 message_conflict. The client retains this UUID on retry until delivery succeeds.

Starting a conversation requires an active listing (409 listing_unavailable) belonging to somebody else (400 cannot_message_self). A missing listing returns 404 listing_not_found. Existing conversations can continue after a listing is completed, paused or deleted. Read positions only advance and cannot acknowledge another conversation's message (400 invalid_read_position). A later incoming message remains unread when acknowledging an older ID.

The React chat polls history every 3 seconds and inbox/badge every 5 seconds while the app is active; this phase uses HTTP polling, not WebSocket push. Open, focused conversations acknowledge fetched messages; leaving a conversation or focusing another window leaves new arrivals unread. History uses cursor pagination; inbox uses page pagination. Text messages only: attachments, typing/presence indicators, delivery/read receipts for the sender, email/push notifications, message editing/deletion, moderation and rate limiting are not implemented.

Local test: use two separate browsers or normal/incognito windows, one account each. Owner publishes an active listing; the other account chooses Javi se and sends a message. Check the owner's unread badge before opening Poruke, reply from there, then refresh and restart the servers to confirm persistence. A newly opened ordinary tab may copy sessionStorage from its opener, so separate browser contexts avoid accidental reuse of the same login.


## Public user profiles
GET /api/users/:id/public is public and returns only id, displayName, age, occupation, city, bio and avatarUrl. Email, passwordHash and internal media IDs are never included. Unknown users return 404 user_not_found. The chat participant avatar and name link to /users/:id; that page can link back to the originating conversation. A separate listing context card above messages shows the listing title and detail link; deleted listings retain their snapshot title without a broken link.
