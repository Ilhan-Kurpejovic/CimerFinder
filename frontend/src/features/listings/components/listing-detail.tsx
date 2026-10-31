import { personalTags } from '../lib/roommate-options'
import { ContactListing } from '@/components/messaging/contact-listing'
import { listingStatusLabels } from './listing-status-control'
import { ListingGallery } from './listing-gallery'
import { ApiError, apiMessage } from '@/lib/api-client'
import { Link, useLocation, useParams } from 'react-router'
import { ArrowLeft, Heart, MapPin, Maximize, Users, Check } from 'lucide-react'
import { useSavedListings } from '@/lib/use-saved-listings'
import { useListing } from '../api/use-listings'
export function ListingDetail() {
  const { id } = useParams()
  const location = useLocation()
  const { data: item, isPending, isError, error, refetch } = useListing(Number(id))
  const [saved, toggleSaved, favorites] = useSavedListings()
  if (isPending)
    return (
      <div className="container page-content" aria-busy="true">
        <div className="detail-skeleton" />
      </div>
    )
  if (isError || !item)
    return (
      <div className="container empty-state">
        <h1>
          {error instanceof ApiError && error.status === 404
            ? 'Oglas nije pronađen.'
            : 'Oglas trenutno nije dostupan.'}
        </h1>
        <p>{apiMessage(error)}</p>
        <button className="btn btn-outline" onClick={() => refetch()}>
          Pokušaj ponovo
        </button>
        <Link className="btn btn-primary" to="/listings">
          Nazad na oglase
        </Link>
      </div>
    )
  const selected = saved.includes(item.id)
  return (
    <div className="container page-content detail-page">
      {location.state?.listingUpdated === item.id && (
        <p className="profile-success listing-update-success" role="status">
          <Check size={17} />
          Izmjene oglasa su sačuvane.
        </p>
      )}
      <Link className="back-link" to={item.kind === 'room' ? '/listings' : '/roommates'}>
        <ArrowLeft size={16} />
        Nazad na oglase
      </Link>
      {item.status && item.status !== 'active' && (
        <p className="listing-status-notice" role="status">
          <strong>{listingStatusLabels[item.status]}</strong> —{' '}
          {item.status === 'paused' ? 'Oglas je privremeno pauziran.' : 'Potraga za cimerom je završena.'}
        </p>
      )}
      <div className="detail-heading">
        <div>
          <span className="eyebrow">{item.kind === 'room' ? 'TVOJ SLJEDEĆI DOM' : 'TVOJ BUDUĆI CIMER'}</span>
          <h1>{item.title}</h1>
          <p className="location">
            <MapPin size={16} />
            {item.city} · {item.neighborhood}
          </p>
        </div>
        <button
          className={`btn btn-outline ${selected ? 'is-saved' : ''}`}
          disabled={favorites.pending || !!favorites.error}
          aria-pressed={selected}
          onClick={() => toggleSaved(item.id)}
        >
          <Heart size={18} fill={selected ? 'currentColor' : 'none'} />
          {selected ? 'Sačuvano' : 'Sačuvaj oglas'}
        </button>
      </div>
      {favorites.error && (
        <p className="field-error" role="alert">
          {favorites.error}{' '}
          <button type="button" onClick={favorites.retry}>
            Pokušaj ponovo
          </button>
        </p>
      )}
      <div className="detail-layout">
        <div>
          {item.kind === 'room' ? (
            <ListingGallery
              key={item.id}
              urls={item.imageUrls?.length ? item.imageUrls : [item.imageUrl]}
              title={item.title}
            />
          ) : (
            <section className="roommate-detail-hero">
              <img src={item.avatar} alt={'Profilna fotografija: ' + item.name} />
              <div>
                <span className="eyebrow">TRAŽIM CIMERA I STAN</span>
                <h2>
                  {item.name}
                  {item.age !== null && <span>, {item.age}</span>}
                </h2>
                <p className="roommate-detail-occupation">{item.occupation}</p>
                {item.authorBio && <p className="roommate-detail-bio">{item.authorBio}</p>}
                {item.userId && (
                  <Link className="text-link" to={'/users/' + item.userId} state={{ listingId: item.id }}>
                    Pogledaj moj profil →
                  </Link>
                )}
              </div>
            </section>
          )}

          <div className="detail-facts">
            {item.kind === 'room' ? (
              <>
                <span>
                  <Maximize size={22} />
                  <strong>{item.area} m²</strong>površina sobe
                </span>
                <span>
                  <Users size={22} />
                  <strong>
                    {item.roommates} {item.roommates === 1 ? 'cimer' : 'cimera'}
                  </strong>
                  u stanu
                </span>
              </>
            ) : (
              <span>
                <Users size={22} />
                <strong>
                  {item.roommates}{' '}
                  {item.roommates >= 5 ? 'cimera' : item.roommates === 1 ? 'cimer' : 'cimera'}
                </strong>
                za zajednički dom
              </span>
            )}
            <span>
              <MapPin size={22} />
              <strong>{item.city}</strong>
              {item.neighborhood}
            </span>
          </div>
          <section className="detail-description">
            <h2>{item.kind === 'room' ? 'Malo više o tvom novom domu' : 'Kako zamišljam zajednički dom'}</h2>
            <p>{item.description}</p>
            <h3>{item.kind === 'room' ? 'Šta te ovdje čeka' : 'Navike i interesovanja'}</h3>
            <div className="amenities">
              {(item.kind === 'roommate' ? personalTags(item.tags) : item.tags).map((tag) => (
                <span key={tag}>
                  <Check size={16} />
                  {tag}
                </span>
              ))}
            </div>
          </section>
        </div>
        <aside className="contact-card">
          {item.kind === 'roommate' && (
            <span className="roommate-budget-label">BUDŽET ZA MOJ DIO STANARINE</span>
          )}
          <div className="detail-price">
            {item.kind === 'roommate' ? 'do ' : ''}
            {item.price} €<span>/ mjesečno</span>
          </div>
          <p className="muted">
            {item.kind === 'room'
              ? 'Dogovor o računima i depozitu pri upoznavanju.'
              : 'Ovo je iznos koji mogu mjesečno izdvojiti za svoj dio stanarine.'}
          </p>
          {item.kind === 'room' && (
            <div className="contact-person">
              <img src={item.avatar} alt={item.name} />
              <h3>
                {item.name}, {item.age}
                <small>{item.occupation}</small>
              </h3>
            </div>
          )}
          {item.kind === 'room' && item.authorBio && <p className="author-bio">{item.authorBio}</p>}
          <p>Jedna poruka može biti početak dobre priče.</p>
          <ContactListing
            id={item.id}
            ownerId={item.userId}
            name={item.name}
            active={!item.status || item.status === 'active'}
          />
          <hr />
          <p className="contact-tip">
            <Heart size={17} />
            Upoznajte se i dogovorite detalje pre useljenja.
          </p>
          <small>Objavljeno {new Intl.DateTimeFormat('sr-Latn-RS').format(new Date(item.createdAt))}</small>
        </aside>
      </div>
    </div>
  )
}
