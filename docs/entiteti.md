# Entiteti

> Ovaj fajl je specifikacija za backend radionicu (sljedeće subote).
> Za svaki entitet: polja sa tipovima, veze, i ko šta smije da radi.

## Oglas (primjer, zamijenite svojim)

| Polje | Tip | Obavezno | Napomena |
| --- | --- | --- | --- |
| id | broj | da | dodjeljuje backend |
| naziv | tekst, 3–80 znakova | da | |
| opis | tekst | ne | |
| cijena | broj ≥ 0, € | da | |
| kategorija | `igre` \| `konzole` \| `oprema` | da | |
| grad | tekst | da | |
| slikaUrl | URL | ne | |
| kreirano | datum | da | dodjeljuje backend |

**Veze:** oglas pripada jednom korisniku (prodavcu).

**Pravila pristupa:** svi vide oglase; samo prijavljen korisnik pravi oglas; samo autor mijenja i briše svoj oglas.

**API koji frontend očekuje:** `GET /oglasi?pretraga=`, `GET /oglasi/:id`, `POST /oglasi`, `PATCH /oglasi/:id`, `DELETE /oglasi/:id`.
