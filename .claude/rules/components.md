---
paths:
  - "src/**/*.tsx"
---

# Komponente

- Jedna komponenta po fajlu, imenovani export, ime fajla u kebab-case (`oglas-kartica.tsx`)
- Props tip definisan odmah iznad komponente
- Varijante (veličina, stanje) preko `cva`, ne preko if-ova u `className`
- Komponenta ne dohvata podatke: dobija ih kroz props ili hook iz `src/features/<ime>/api/use-<ime>.ts`
- Komponenta jednog feature-a ide u `src/features/<ime>/components/`; u `src/components/` samo ono što koriste bar dva feature-a
- Ruta u `src/app/routes/` samo spaja komponente feature-a i layout, bez sopstvene logike za podatke
- Fajlove u `src/components/ui/` ne mijenjaj ručno, nove dodaj sa `npx shadcn@latest add <ime>`
- Interaktivni elementi su `button` ili `a`, nikad `div` sa onClick
