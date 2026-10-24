import { Link } from 'react-router'
import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { useCurrentUser } from '@/lib/use-current-user'
import { useListings } from '../api/use-listings'
import { ListingsList } from './listings-list'
import { DeleteListingButton } from './delete-listing-button'
export function MyListings() {
  const user = useCurrentUser()
  const [deleted, setDeleted] = useState('')
  const { data = [], isPending, isError, refetch } = useListings()
  const own = data.filter((item) => !!user && item.userId === user.id)
  return (
    <section id="moji-oglasi" className="my-listings">
      <div className="section-heading">
        <div>
          <span className="eyebrow">TVOJI NOVI POČECI</span>
          <h2>
            Moji oglasi <span>({own.length})</span>
          </h2>
          <p>Samo oglasi povezani sa ovim profilom.</p>
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
          )}
        />
      )}
    </section>
  )
}
