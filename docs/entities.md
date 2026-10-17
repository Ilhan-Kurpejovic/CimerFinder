# Entities

## Listing

Code: frontend/src/features/listings/types.ts and api/listings-api.ts.

| Field | Type | Meaning |
| --- | --- | --- |
| id | number | Generated identifier |
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

## Demo user and favorites

cimer-user stores name and email. Demo login validates an email and a six-character minimum password, then discards the password. It provides no security or authorization. Publishing is intentionally available without login for demonstration.

cimer-saved stores an array of listing IDs, shared across header, cards, details and the favorites route using a local external-store hook.

Contact messages are validated and acknowledged in the modal but never sent or stored. There is no messaging service, backend, payment flow or real account system.
