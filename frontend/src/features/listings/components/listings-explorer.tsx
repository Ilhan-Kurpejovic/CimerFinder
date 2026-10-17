import { useSearchParams } from 'react-router'
import { Heart, Search, SlidersHorizontal, X } from 'lucide-react'
import { useLocalState } from '@/lib/use-local-state'
import { useListings } from '../api/use-listings'
import { ListingsList } from './listings-list'
export function ListingsExplorer({
  kind = 'room',
  savedOnly = false,
}: {
  kind?: 'room' | 'roommate'
  savedOnly?: boolean
}) {
  const [params, setParams] = useSearchParams()
  const [saved] = useLocalState<number[]>('cimer-saved', [])
  const { data = [], isPending, isError, refetch } = useListings(params.get('q') || '')
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }
  const city = params.get('city') || '',
    budget = params.get('budget') || ''
  let items = data.filter(
    (l) =>
      (savedOnly ? saved.includes(l.id) : l.kind === kind) &&
      (!city || l.city === city) &&
      (!budget || l.price <= Number(budget)) &&
      (!params.get('pet') || l.tags.includes('Pet friendly')),
  )
  if (params.get('sort') === 'price') items = [...items].sort((a, b) => a.price - b.price)
  else items = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id)
  return (
    <div className="container page-content">
      <div className="page-intro">
        <span className="eyebrow">{savedOnly ? 'TVOJ UŽI IZBOR' : 'DOBRE PRIČE POČINJU OVDE'}</span>
        <h1>
          {savedOnly
            ? 'Mesta koja ti se sviđaju.'
            : kind === 'room'
              ? 'Pronađi mesto za sebe.'
              : 'Pronađi svoje ljude.'}
          {savedOnly && <Heart size={30} />}
        </h1>
        <p>
          {savedOnly
            ? 'Sačuvani oglasi na jednom mestu, za lakšu odluku.'
            : kind === 'room'
              ? 'Soba po tvojoj meri. Cimeri po tvojoj energiji.'
              : 'Upoznaj buduće cimere, njihove navike i planove.'}
        </p>
      </div>
      <div className="explorer-layout">
        <aside className="filters">
          <h3>
            <SlidersHorizontal size={18} />
            Tvoja pretraga
          </h3>
          <label>
            Ključna reč
            <div className="input-icon">
              <Search size={16} />
              <input
                value={params.get('q') || ''}
                onChange={(e) => update('q', e.target.value)}
                placeholder="Naselje, ime, oglas..."
              />
            </div>
          </label>
          <label>
            Grad
            <select value={city} onChange={(e) => update('city', e.target.value)}>
              <option value="">Svi gradovi</option>
              {['Beograd', 'Novi Sad', 'Niš', 'Kragujevac'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Maksimalni budžet
            <div className="input-suffix">
              <input
                type="number"
                min="0"
                max="5000"
                placeholder="Bez ograničenja"
                value={budget}
                onChange={(e) => update('budget', e.target.value)}
              />
              <span>€ / mes.</span>
            </div>
          </label>
          <label className="check-label">
            <input
              type="checkbox"
              checked={params.has('pet')}
              onChange={(e) => update('pet', e.target.checked ? '1' : '')}
            />
            Dozvoljeni ljubimci
          </label>
          <button className="reset-button" onClick={() => setParams({})}>
            <X size={14} />
            Poništi filtere
          </button>
          <div className="filter-note">
            <Heart size={20} />
            <strong>Dom je više od adrese.</strong>
            <p>Biraj i prostor i ljude uz koje se osećaš dobro.</p>
          </div>
        </aside>
        <section className="explorer-results">
          <div className="results-bar">
            <span>
              <strong>{items.length}</strong> {items.length === 1 ? 'oglas' : 'oglasa'} za tvoj novi početak
            </span>
            <label className="sort-label">
              Poređaj po
              <select value={params.get('sort') || 'newest'} onChange={(e) => update('sort', e.target.value)}>
                <option value="newest">Najnovijem</option>
                <option value="price">Najnižoj ceni</option>
              </select>
            </label>
          </div>
          <ListingsList items={items} loading={isPending} error={isError} retry={() => refetch()} />
        </section>
      </div>
    </div>
  )
}
