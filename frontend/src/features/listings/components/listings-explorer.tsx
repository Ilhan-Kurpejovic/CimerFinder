import { cities } from '@/lib/cities'
import { useSearchParams } from 'react-router'
import { Heart, Search, SlidersHorizontal, X } from 'lucide-react'
import { useSavedListings } from '@/lib/use-saved-listings'
import { useListingsPage } from '../api/use-listings'
import { ListingsList } from './listings-list'
import { ListingPagination } from './listing-pagination'
export function ListingsExplorer({
  kind = 'room',
  savedOnly = false,
}: {
  kind?: 'room' | 'roommate'
  savedOnly?: boolean
}) {
  const [params, setParams] = useSearchParams()
  const [saved, , favorites] = useSavedListings()
  const page = Math.max(1, Math.trunc(Number(params.get('page')) || 1))
  const city = params.get('city') || '',
    budget = params.get('budget') || ''
  const { data, isPending, isError, refetch } = useListingsPage(params.get('q') || '', {
    page,
    size: 9,
    kind: savedOnly ? undefined : kind,
    city,
    maxPrice: budget ? Number(budget) : undefined,
    petFriendly: params.has('pet'),
    sort: params.get('sort') === 'price' ? 'price' : 'newest',
    ids: savedOnly && !favorites.signedIn ? saved : undefined,
    favorites: savedOnly && favorites.signedIn,
  })
  const items = data?.items || []
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next, { replace: true })
  }
  return (
    <div className="container page-content">
      <div className="page-intro">
        <span className="eyebrow">{savedOnly ? 'TVOJ UŽI IZBOR' : 'DOBRE PRIČE POČINJU OVDJE'}</span>
        <h1>
          {savedOnly
            ? 'Mjesta koja ti se sviđaju.'
            : kind === 'room'
              ? 'Pronađi mjesto za sebe.'
              : 'Pronađi svoje ljude.'}
          {savedOnly && <Heart size={30} />}
        </h1>
        <p>
          {savedOnly
            ? favorites.signedIn
              ? 'Tvoji omiljeni oglasi, dostupni sa svakog uređaja.'
              : 'Oglasi sačuvani na ovom uređaju. Prijavi se za čuvanje na svom nalogu.'
            : kind === 'room'
              ? 'Soba po tvojoj mjeri. Cimeri po tvojoj energiji.'
              : 'Upoznaj buduće cimere, njihove navike i planove.'}
        </p>
      </div>
      {savedOnly && favorites.error && (
        <p className="field-error" role="alert">
          {favorites.error} <button onClick={favorites.retry}>Pokušaj ponovo</button>
        </p>
      )}
      <div className="explorer-layout">
        <aside className="filters">
          <h3>
            <SlidersHorizontal size={18} />
            Tvoja pretraga
          </h3>
          <label>
            Ključna riječ
            <div className="input-icon">
              <Search size={16} />
              <input
                value={params.get('q') || ''}
                onChange={(e) => update('q', e.target.value)}
                placeholder="Naselje ili naslov oglasa..."
              />
            </div>
          </label>
          <label>
            Grad
            <select value={city} onChange={(e) => update('city', e.target.value)}>
              <option value="">Svi gradovi</option>
              {city && !cities.includes(city) && <option value={city}>{city}</option>}
              {cities.map((c) => (
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
              <span>€ / mjes.</span>
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
            <p>Biraj i prostor i ljude uz koje se osjećaš dobro.</p>
          </div>
        </aside>
        <section className="explorer-results">
          <div className="results-bar">
            <span>
              <strong>{data?.total || 0}</strong> {data?.total === 1 ? 'oglas' : 'oglasa'} za tvoj novi
              početak
            </span>
            <label className="sort-label">
              Poređaj po
              <select value={params.get('sort') || 'newest'} onChange={(e) => update('sort', e.target.value)}>
                <option value="newest">Najnovijem</option>
                <option value="price">Najnižoj cijeni</option>
              </select>
            </label>
          </div>
          <ListingsList items={items} loading={isPending} error={isError} retry={() => refetch()} />
          {!isPending && !isError && (
            <ListingPagination
              page={page}
              pages={data?.pages || 0}
              onChange={(value) => update('page', String(value))}
            />
          )}
        </section>
      </div>
    </div>
  )
}
