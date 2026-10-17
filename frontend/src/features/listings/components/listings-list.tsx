import { Link } from 'react-router'
import type { ReactNode } from 'react'
import { SearchX } from 'lucide-react'
import { ListingCard } from './listing-card'
import type { Listing } from '../types'
export function ListingsList({
  items,
  loading,
  error,
  retry,
  renderActions,
}: {
  items: Listing[]
  loading?: boolean
  error?: boolean
  retry?: () => void
  renderActions?: (item: Listing) => ReactNode
}) {
  if (loading)
    return (
      <div className="listing-grid" aria-label="Učitavanje oglasa" aria-busy="true">
        {[1, 2, 3].map((i) => (
          <div className="card-skeleton" key={i} />
        ))}
      </div>
    )
  if (error)
    return (
      <div className="empty-state">
        <h3>Oglasi trenutno nisu dostupni.</h3>
        <button className="btn btn-primary" onClick={retry}>
          Pokušaj ponovo
        </button>
      </div>
    )
  if (!items.length)
    return (
      <div className="empty-state">
        <SearchX size={36} />
        <h3>Još nema oglasa za ovaj izbor.</h3>
        <p>Promeni grad ili povećaj budžet i pokušaj ponovo.</p>
        <Link className="text-link" to="/listings">
          Pogledaj sve oglase →
        </Link>
      </div>
    )
  return (
    <div className="listing-grid">
      {items.map((item) =>
        renderActions ? (
          <div className="owned-listing" key={item.id}>
            <ListingCard listing={item} />
            {renderActions(item)}
          </div>
        ) : (
          <ListingCard key={item.id} listing={item} />
        ),
      )}
    </div>
  )
}
