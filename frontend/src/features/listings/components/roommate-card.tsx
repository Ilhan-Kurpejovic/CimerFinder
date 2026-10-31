import { Link } from 'react-router'
import { ArrowUpRight, Heart, MapPin, Users } from 'lucide-react'
import { useSavedListings } from '@/lib/use-saved-listings'
import { personalTags } from '../lib/roommate-options'
import { listingStatusLabels } from './listing-status-control'
import type { Listing } from '../types'

export function RoommateCard({ listing }: { listing: Listing }) {
  const [saved, toggleSaved, favorites] = useSavedListings()
  const selected = saved.includes(listing.id)
  const tags = personalTags(listing.tags)
  return (
    <article className="listing-card roommate-card">
      <div className="roommate-card-header">
        <span>
          <Users size={14} />
          Tražim cimera i stan
        </span>
        <button
          type="button"
          className={'save-button ' + (selected ? 'is-saved' : '')}
          aria-label={selected ? 'Ukloni iz sačuvanih' : 'Sačuvaj oglas'}
          aria-pressed={selected}
          disabled={favorites.pending || !!favorites.error}
          onClick={() => toggleSaved(listing.id)}
        >
          <Heart size={18} fill={selected ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="roommate-card-person">
        <Link
          className="roommate-card-portrait"
          to={'/listings/' + listing.id}
          aria-label={'Upoznaj: ' + listing.name}
        >
          <img src={listing.avatar} alt={'Profilna fotografija: ' + listing.name} loading="lazy" />
        </Link>
        <h3>
          <Link to={'/listings/' + listing.id}>
            {listing.name}
            {listing.age !== null && <span>, {listing.age}</span>}
          </Link>
        </h3>
        {listing.occupation && <p>{listing.occupation}</p>}
        <span className="roommate-card-city">
          <MapPin size={13} />
          Tražim dom u gradu: {listing.city}
        </span>
      </div>
      <div className="roommate-card-body">
        {listing.status && listing.status !== 'active' && (
          <span className={'listing-status-badge status-' + listing.status}>
            {listingStatusLabels[listing.status]}
          </span>
        )}
        <Link className="roommate-card-headline" to={'/listings/' + listing.id}>
          {listing.title}
        </Link>
        <p className="roommate-card-bio">{listing.authorBio?.trim() || listing.description}</p>
        {tags.length > 0 && (
          <div className="tags">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        )}
        <div className="roommate-card-budget">
          <div>
            <span>Moj mjesečni budžet</span>
            <small>Za moj dio stanarine</small>
          </div>
          <strong>
            do {listing.price} €<small>/ mjesečno</small>
          </strong>
        </div>
      </div>
      {favorites.error && (
        <p className="field-error" role="alert">
          {favorites.error}{' '}
          <button type="button" onClick={favorites.retry}>
            Pokušaj ponovo
          </button>
        </p>
      )}
      <Link className="card-link" to={'/listings/' + listing.id}>
        Upoznaj me i moju potragu
        <ArrowUpRight size={16} />
      </Link>
    </article>
  )
}
