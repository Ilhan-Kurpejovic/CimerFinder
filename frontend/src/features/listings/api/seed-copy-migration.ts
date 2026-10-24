import type { Listing } from '../types'

// Refresh exact legacy demo copy without rewriting user-authored listings or edits.
const previousCopy: Record<string, string> = {
  'Izdajemo svetlu, potpuno nameštenu sobu u prostranom stanu na Vračaru. Stan ima zajednički dnevni boravak, opremljenu kuhinju i terasu za jutarnju kafu. Blizu su prevoz, market i omiljene gradske kafeterije. Tražimo urednu i opuštenu osobu koja voli da ima svoj mir, ali i povremeno zajedničko druženje. Internet je uključen, a ostale račune delimo ravnopravno.':
    'Izdajemo svijetlu, potpuno namještenu sobu u prostranom stanu na Vračaru. Stan ima zajednički dnevni boravak, opremljenu kuhinju i terasu za jutarnju kafu. Blizu su prevoz, market i omiljene gradske kafeterije. Tražimo urednu i opuštenu osobu koja voli da ima svoj mir, ali i povremeno zajedničko druženje. Internet je uključen, a ostale račune dijelimo ravnopravno.',
  'Svetla soba, dobra energija': 'Svijetla soba, dobra energija',
  'Tražim cimera ili cimerku za udoban stan na Grbavici. Soba je svetla i ima radni sto, veliki orman i udoban krevet. U stanu je mirno tokom radnog vremena. Vikendom volimo filmove i kuvanje. Useljenje je moguće odmah, depozit je jedna mesečna kirija.':
    'Tražim cimera ili cimerku za udoban stan na Grbavici. Soba je svijetla i ima radni sto, veliki orman i udoban krevet. U stanu je mirno tokom radnog vremena. Vikendom volimo filmove i kuvanje. Useljenje je moguće odmah, depozit je jedna mjesečna kirija.',
  'Prostrana soba u stanu pored parka. Imamo mnogo prirodnog svetla, biljaka i dovoljno prostora za učenje i odmor. Dobra povezanost sa centrom i fakultetima. Tražimo osobu koja poštuje zajednički prostor i voli prijatnu kućnu atmosferu.':
    'Prostrana soba u stanu pored parka. Imamo mnogo prirodnog svjetla, biljaka i dovoljno prostora za učenje i odmor. Dobra povezanost sa centrom i fakultetima. Tražimo osobu koja poštuje zajednički prostor i voli prijatnu kućnu atmosferu.',
  'Slobodna soba u urednom stanu u centru Niša. Sve je na nekoliko minuta peške. Opremljena kuhinja, veš mašina i brz internet. Računi se dele na dve osobe.':
    'Slobodna soba u urednom stanu u centru Niša. Sve je na nekoliko minuta pješke. Opremljena kuhinja, veš mašina i brz internet. Računi se dijele na dvije osobe.',
  'Selim se u Beograd zbog posla i tražim prijatan stan i osobu sa kojom bih ga delila. Volim jutarnju kafu, knjige i šetnje. Radim iz kancelarije, poštujem tuđi prostor i dogovore. Budžet mi je do 300 € za kiriju.':
    'Selim se u Beograd zbog posla i tražim prijatan stan i osobu sa kojom bih ga dijelila. Volim jutarnju kafu, knjige i šetnje. Radim iz kancelarije, poštujem tuđi prostor i dogovore. Budžet mi je do 300 € za kiriju.',
  'Tražim cimera za zajednički pronalazak stana. Radim od kuće, volim sport i kuvanje. Važni su mi urednost i otvorena komunikacija. Voleo bih da stan ima odvojene sobe i dobar internet.':
    'Tražim cimera za zajednički pronalazak stana. Radim od kuće, volim sport i kuvanje. Važni su mi urednost i otvorena komunikacija. Volio bih da stan ima odvojene sobe i dobar internet.',
  Namešteno: 'Namješteno',
}

export function localizeLegacySeed(item: Listing): Listing {
  if (item.userId || ![1, 2, 3, 4, 5, 6].includes(item.id)) return item
  return {
    ...item,
    title: previousCopy[item.title] ?? item.title,
    description: previousCopy[item.description] ?? item.description,
    tags: item.tags.map((tag) => previousCopy[tag] ?? tag),
  }
}
