import { Link, useParams } from 'react-router'
import { useCurrentUser } from '@/lib/use-current-user'
import { useListing } from '../api/use-listings'
import { ListingForm } from './listing-form'
export function EditListing() {
  const { id } = useParams()
  const user = useCurrentUser()
  const { data: listing, isPending, isError, refetch } = useListing(Number(id))
  if (!user)
    return (
      <div className="container page-content">
        <div className="empty-state">
          <h1>Prijavi se da urediš svoj oglas.</h1>
          <p>Izmjene može sačuvati samo vlasnik oglasa.</p>
          <Link className="btn btn-primary" to={`/login?next=/listings/${id}/edit`}>
            Prijavi se
          </Link>
        </div>
      </div>
    )
  if (isPending)
    return (
      <div className="container page-content" aria-busy="true" aria-label="Učitavanje oglasa za uređivanje">
        <div className="detail-skeleton" />
      </div>
    )
  if (isError || !listing)
    return (
      <div className="container page-content">
        <div className="empty-state">
          <h1>Oglas nije dostupan.</h1>
          <p>Možda je obrisan ili trenutno ne može da se učita.</p>
          <button className="btn btn-outline" onClick={() => refetch()}>
            Pokušaj ponovo
          </button>
          <Link className="btn btn-primary" to="/profile#moji-oglasi">
            Moji oglasi
          </Link>
        </div>
      </div>
    )
  if (listing.userId !== user.id)
    return (
      <div className="container page-content">
        <div className="empty-state">
          <h1>Možeš uređivati samo svoje oglase.</h1>
          <p>Ovaj oglas pripada drugom korisniku.</p>
          <Link className="btn btn-primary" to="/profile#moji-oglasi">
            Moji oglasi
          </Link>
        </div>
      </div>
    )
  return <ListingForm key={`${listing.id}:${user.id}`} listing={listing} />
}
