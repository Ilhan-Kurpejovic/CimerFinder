# CimerFinder design

## Product and audience
Find a room, a compatible roommate and a welcoming shared home. Designed for students and young professionals in Serbian cities, with Serbian Latin product copy.

## Direction
Warm, personal, calm. A light lavender hero and purple brand derived from the supplied CimerFinder reference. An editorial heading, generous whitespace and real interior photography make the room search feel welcoming.

## Tokens
All values live in src/index.css. Primary purple #7044c6; dark ink #292437; lavender canvas #f6f3fc; pale purple #f1ebfa; white surfaces; subtle #eae6ef borders. Green appears only on positive confirmations. Manrope for headings and DM Sans for text, with local sans-serif fallbacks. Rounded cards, restrained shadows and asymmetrical hero photo corners.

## Layout
1220 px maximum content width. Three listing columns on desktop, two in the filtered results area and one on mobile. Compact stacked mobile search, a collapsible navigation, full-width form controls and a reading-focused detail layout. No horizontal content scrolling. Primary actions use purple, secondary actions use outlined or text styling.

## Content and interaction
Realistic mock rooms and profiles for Beograd, Novi Sad and Nis. Every input is labeled, icons accompany text, focus rings are visible and reduced-motion preferences are respected. Listings support loading, error and empty states. Native modal dialog provides keyboard focus management. Demo actions are clearly labeled; no artificial verification badges or invented platform statistics.

## Asset sources
Unsplash interior photographs, Pravatar profile photos, Lucide icons. CSS house illustration and an SVG underline are code-native decorative assets.

## Profile and account experience
The top-right avatar opens links to the profile, personal listings and logout. A two-column profile page shows saved public information beside a labeled editor; it stacks on mobile. Upload preview, reset, pending, error and success states distinguish unsaved changes from the saved profile. The public author information uses current profile data, while room photographs remain property-specific. A local SVG placeholder replaces unrelated mock portraits for new users.

## Language
All product copy uses Serbian Latin in the Ijekavian form, including validation, accessibility labels and demo listing text. Exact legacy seed copy is localized when read; user-authored profile and listing text is preserved.

## Listing owner actions
Place Uredi oglas and Obriši oglas in an aligned action row directly below each personal listing card. Use pale purple and a pencil icon to give editing visual priority; keep deletion in a quieter bordered style with destructive text. Both controls have at least 44 px targets. The editor reuses the publishing form, shows the existing photo, includes cancellation and confirms a successful save on the details page.
