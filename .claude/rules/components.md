---
paths:
  - "src/components/**/*.tsx"
---

# Komponente

- Jedna komponenta po fajlu, imenovani export, ime fajla u kebab-case (`oglas-kartica.tsx`)
- Props tip definisan odmah iznad komponente
- Varijante (veličina, stanje) preko `cva`, ne preko if-ova u `className`
- Komponenta ne dohvata podatke: dobija ih kroz props ili hook iz `src/hooks/`
- Fajlove u `src/components/ui/` ne mijenjaj ručno, nove dodaj sa `npx shadcn@latest add <ime>`
- Interaktivni elementi su `button` ili `a`, nikad `div` sa onClick
