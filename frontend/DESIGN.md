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

## Connected application
Registration/login, profiles and listings use the backend. Forms upload photos from the device with previews. Loading, authentication expiry and server-error states are distinct. Search and personal listings use server pagination. The purple visual system and Ijekavian product copy are preserved. Favorites are stored per signed-in account and private chat supports listing conversations, replies and unread badges.


## Photo selection and galleries
Shared purple dashed upload area supports file selection and drag/drop. Profile photos have a circular preview; room photos use a responsive grid with remove actions and a clearly labelled cover button. JPG/PNG/WebP, 5 MB each, at most eight per room listing. Save is disabled during upload, and captions distinguish draft selection from a saved profile/listing. Listing details show the cover with arrows, a counter and accessible thumbnail buttons.


## Listing status confirmation
Personal listing cards use a compact status row with a colored dot and Promijeni action. A modal offers two labelled radio choices (Aktivan and Prona?en cimer) and explains search, favorites and contact visibility for the selected status. Only Potvrdi promjenu sends the update; cancellation leaves the saved status unchanged. Pending and retryable failure states remain inside the modal.


## Account workspace
Moj profil and Moji oglasi have separate routes (/profile and /my-listings), linked by an accessible account navigation and the account dropdown. A lavender header establishes page hierarchy. Profile editing uses separate photo, basic information and biography cards beside a saved-profile preview; the sidebar stacks above the form on small screens. Email appears as private read-only account information. Existing /profile#moji-oglasi bookmarks redirect to the new listings page. Status confirmation, editing and deletion remain available on the personal listings page.


## Private conversations
Poruke is accessible from the header icon, account menu and account navigation. Desktop layout places an inbox beside the conversation; mobile separates the list and active conversation with a back action. Own messages use purple, received messages white on lavender. The composer preserves text after a failure, supports Enter and Shift+Enter, and prevents duplicate submissions while pending. New messages are fetched through HTTP polling; unread badges acknowledge only the focused conversation.


## Chat identity and listing context
The chat header links the participant avatar and name to a dedicated public profile, with a return link to the same conversation. A separate context card above the message history uses a house icon, RAZGOVOR O OGLASU label, a larger title and an explicit listing action. Deleted listings retain the title and a removal notice. Public profiles show shared profile information and biography only; account email remains private.


## People seeking roommates and a home
Roommate cards use a circular profile portrait, prominent name/age/occupation, search city, personal biography and a clearly labelled individual monthly rent budget. They do not use property cover photos, a repeated author row or property amenity tags. Detail pages introduce the person with their current profile photo and biography before their search preferences. Publishing this type reuses profile data and asks for search city, optional neighborhood, budget, number of desired roommates and expectations/lifestyle. Property area and photo uploads remain exclusive to room listings; the existing API area field keeps a compatibility value without being presented as a real property attribute.
