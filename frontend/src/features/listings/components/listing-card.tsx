import { Link } from 'react-router'
import { ArrowUpRight, Heart, MapPin, Maximize, Users } from 'lucide-react'
import { useLocalState } from '@/lib/use-local-state'
import type { Listing } from '../types'
export function ListingCard({ listing }: { listing: Listing }) {
  const [saved, setSaved] = useLocalState<number[]>('cimer-saved', [])
  const selected = saved.includes(listing.id)
  return (
    <article className="listing-card">
      <div className="card-photo">
        <Link to={`/listings/${listing.id}`}>
          <img
            src={listing.imageUrl}
            alt={listing.kind === 'room' ? listing.title : `Profil: ${listing.name}`}
            loading="lazy"
          />
        </Link>
        <span className="photo-label">{listing.kind === 'room' ? 'Soba za izdavanje' : 'Tražim cimera'}</span>
        <button
          className={`save-button ${selected ? 'is-saved' : ''}`}
          aria-label={selected ? 'Ukloni iz sačuvanih' : 'Sačuvaj oglas'}
          aria-pressed={selected}
          onClick={() =>
            setSaved(selected ? saved.filter((id) => id !== listing.id) : [...saved, listing.id])
          }
        >
          <Heart size={18} fill={selected ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="card-body">
        <div className="location">
          <MapPin size={13} />
          {listing.city} · {listing.neighborhood}
        </div>
        <Link to={`/listings/${listing.id}`} className="card-title">
          {listing.title}
        </Link>
        <div className="room-facts">
          {listing.kind === 'room' ? (
            <>
              <span>
                <Maximize size={14} />
                {listing.area} m²
              </span>
              <span>
                <Users size={14} />
                {listing.roommates} {listing.roommates === 1 ? 'cimer' : 'cimera'}
              </span>
            </>
          ) : (
            <span>
              {listing.age} god. · {listing.occupation}
            </span>
          )}
        </div>
        <div className="tags">
          {listing.tags.slice(0, 2).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="card-bottom">
          <div className="mini-profile">
            <img src={listing.avatar} alt="" />
            <span>
              {listing.name}
              <small>{listing.kind === 'room' ? 'Tvoj budući cimer' : 'Traži stan'}</small>
            </span>
          </div>
          <div className="price">
            {listing.price} €<small>/ mesečno</small>
          </div>
        </div>
      </div>
      <Link className="card-link" to={`/listings/${listing.id}`}>
        {listing.kind === 'room' ? 'Upoznaj svoj novi dom' : `Upoznaj: ${listing.name}`}{' '}
        <ArrowUpRight size={15} />
      </Link>
    </article>
  )
}
