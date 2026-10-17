# CimerFinder

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
- Responsive navigation and layouts, reduced-motion support, loading/error states.

## Stack and structure

React 19, Vite 8, Tailwind CSS 4, shadcn/ui, React Router, TanStack Query, React Hook Form, Zod and Lucide. The starter's TypeScript setup is retained.

    frontend/src/app/           Routing and page composition
    frontend/src/features/     Listings and demo authentication
    frontend/src/components/   Shared layout and shadcn/ui primitives
    frontend/src/lib/          Mock helpers and local state
    backend/                   Reserved for a future backend
    docs/entities.md           Data contract

## Demo behavior

No backend or real authentication is connected. No messages are sent. Any valid email and a password of at least six characters can be used for demo login. Passwords are never saved. Listings, favorite IDs and the demo user are stored in this browser's localStorage. Uploaded images are limited to 2 MB and stored as data URLs; browser storage capacity still applies. Clear the cimer-listings, cimer-saved and cimer-user keys in localStorage to reset the demo.

Seed photography comes from Unsplash, profile images from Pravatar and fonts from Google Fonts. These assets require an internet connection and are illustrative.

## Verification

Type checking, the production build and lint/boundary checks are available through the commands above. Run npm --prefix frontend run check:mock for mock API checks. Browser screenshots and interactive visual QA were not available in the implementation session.
