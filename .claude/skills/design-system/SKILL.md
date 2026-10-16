---
name: design-system
description: Dizajn pravila ovog projekta. Koristi kad praviš ili mijenjaš bilo koju UI komponentu, stranicu ili stil, i kad korisnik traži da nešto „izgleda bolje“.
---

# Dizajn sistem

1. Pročitaj DESIGN.md prije bilo koje UI izmjene. Ako je prazan, predloži korisniku da ga prvo popunite zajedno.
2. Boje, fontovi i radius dolaze samo iz tokena u `src/index.css`. Ako treba nova vrijednost, dodaj token, ne hex u kodu.
3. Hijerarhija: jedan jasan glavni element po ekranu (naslov ili akcija), sve ostalo mu je podređeno.
4. Tipografija: najviše dvije veličine naslova po ekranu; tekst 14–16 px; linije do ~70 znakova.
5. Razmaci: velika praznina između sekcija (`py-12` ili više), mala unutar grupa (`gap-2` do `gap-4`).
6. Uzdržano: bez gradijenata, sjena i animacija bez razloga; ikone samo iz `lucide-react`, nikad emoji.
7. Kada korisnik traži novi ekran ili redizajn, ponudi 2–3 različite varijante na privremenim rutama (`/v1`, `/v2`, `/v3`), sa screenshotom svake, pa obriši one koje ne izabere.
8. Uvijek završi screenshotom na 375 px i 1440 px preko Playwright MCP-a.
