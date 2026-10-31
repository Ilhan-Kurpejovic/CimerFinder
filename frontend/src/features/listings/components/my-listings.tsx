import { Link } from 'react-router'
import { useEffect, useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { useCurrentUser } from '@/lib/use-current-user'
import { useListingsPage } from '../api/use-listings'
import { ListingsList } from './listings-list'
import { ListingPagination } from './listing-pagination'
import { ListingStatusControl } from './listing-status-control'
import { DeleteListingButton } from './delete-listing-button'
export function MyListings() {
  const user = useCurrentUser()
  const [deleted, setDeleted] = useState('')
  const [page, setPage] = useState(1)
  const { data, isPending, isError, refetch } = useListingsPage('', { mine: true, page, size: 6 })
  const own = (data?.items || []).filter((item) => !!user && item.userId === user.id)
  useEffect(() => {
    if (data && page > Math.max(1, data.pages)) setPage(Math.max(1, data.pages))
  }, [data, page])
  return (
    <section id="moji-oglasi" className="my-listings">
      <div className="section-heading">
        <div>
          <span className="eyebrow">TVOJI NOVI POČECI</span>
          <h2>
            Pregled oglasa <span>({data?.total || 0})</span>
          </h2>
          <p>Ovdje upravljaš svim svojim oglasima, uključujući završene potrage.</p>
        </div>
        <Link className="btn btn-primary" to="/post">
          <Plus size={17} />
          Objavi oglas
        </Link>
      </div>
      <div role="status" aria-live="polite">
        {deleted && <p className="profile-success deletion-success">Oglas „{deleted}“ je obrisan.</p>}
      </div>
      {!isPending && !isError && !own.length ? (
        <div className="empty-state">
          <h3>Još nemaš objavljenih oglasa.</h3>
          <p>Objavi prvi oglas. Tvoji podaci i fotografija dolaze iz profila.</p>
          <Link className="text-link" to="/post">
            Napravi svoj prvi oglas →
          </Link>
        </div>
      ) : (
        <ListingsList
          items={own}
          loading={isPending}
          error={isError}
          retry={() => refetch()}
          renderActions={(item) => (
            <div>
              <ListingStatusControl listing={item} />
              <div className="listing-owner-actions">
                <Link
                  className="edit-listing-link"
                  to={`/listings/${item.id}/edit`}
                  aria-label={`Uredi oglas: ${item.title}`}
                >
                  <Pencil size={16} />
                  Uredi oglas
                </Link>
                <DeleteListingButton listing={item} onDeleted={setDeleted} />
              </div>
            </div>
          )}
        />
      )}
      {!isPending && !isError && (
        <ListingPagination page={page} pages={data?.pages || 0} onChange={setPage} />
      )}
    </section>
  )
}
