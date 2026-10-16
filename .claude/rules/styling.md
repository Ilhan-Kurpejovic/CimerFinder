---
paths:
  - "src/**/*.tsx"
  - "src/index.css"
---

# Stilovi

- Samo Tailwind klase i tokeni iz `src/index.css` (`bg-primary`, `text-muted-foreground`), bez hex i rgb vrijednosti
- Razmaci po skali: 1, 2, 3, 4, 6, 8, 12, 16 (Tailwind jedinice)
- Mobile-first: osnovne klase su za telefon, `md:` i `lg:` za veće ekrane
- Svaka slika ima `alt`, svaki input ima `label` ili `aria-label`
- Fokus mora biti vidljiv (`focus-visible:`), kontrast teksta najmanje 4.5:1
- Novi token prvo dodaj u `src/index.css` i opiši u DESIGN.md
