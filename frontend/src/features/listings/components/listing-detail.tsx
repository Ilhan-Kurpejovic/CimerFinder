import { Link, useParams } from 'react-router'
import {
  ArrowLeft,
  ArrowUpRight,
  Heart,
  MapPin,
  Maximize,
  MessageCircle,
  Users,
  Check,
  X,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { useLocalState } from '@/lib/use-local-state'
import { Button } from '@/components/ui/button'
import { useListing } from '../api/use-listings'
export function ListingDetail() {
  const { id } = useParams()
  const { data: item, isPending, isError } = useListing(Number(id))
  const [saved, setSaved] = useLocalState<number[]>('cimer-saved', [])
  const [sent, setSent] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  if (isPending)
    return (
      <div className="container page-content" aria-busy="true">
        <div className="detail-skeleton" />
      </div>
    )
  if (isError || !item)
    return (
      <div className="container empty-state">
        <h1>Oglas nije pronađen.</h1>
        <p>Možda je uklonjen ili adresa nije ispravna.</p>
        <Link className="btn btn-primary" to="/listings">
          Nazad na oglase
        </Link>
      </div>
    )
  const selected = saved.includes(item.id)
  return (
    <div className="container page-content detail-page">
      <Link className="back-link" to={item.kind === 'room' ? '/listings' : '/roommates'}>
        <ArrowLeft size={16} />
        Nazad na oglase
      </Link>
      <div className="detail-heading">
        <div>
          <span className="eyebrow">{item.kind === 'room' ? 'TVOJ SLEDEĆI DOM' : 'TVOJ BUDUĆI CIMER'}</span>
          <h1>{item.title}</h1>
          <p className="location">
            <MapPin size={16} />
            {item.city} · {item.neighborhood}
          </p>
        </div>
        <button
          className={`btn btn-outline ${selected ? 'is-saved' : ''}`}
          onClick={() => setSaved(selected ? saved.filter((x) => x !== item.id) : [...saved, item.id])}
        >
          <Heart size={18} fill={selected ? 'currentColor' : 'none'} />
          {selected ? 'Sačuvano' : 'Sačuvaj oglas'}
        </button>
      </div>
      <div className="detail-layout">
        <div>
          <img
            className={`detail-image ${item.kind === 'roommate' ? 'profile-image' : ''}`}
            src={item.imageUrl}
            alt={item.title}
          />
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
                <strong>{item.age} godina</strong>
                {item.occupation}
              </span>
            )}
            <span>
              <MapPin size={22} />
              <strong>{item.city}</strong>
              {item.neighborhood}
            </span>
          </div>
          <section className="detail-description">
            <h2>{item.kind === 'room' ? 'Malo više o tvom novom domu' : `Upoznaj: ${item.name}`}</h2>
            <p>{item.description}</p>
            <h3>{item.kind === 'room' ? 'Šta te ovde čeka' : 'Navike i interesovanja'}</h3>
            <div className="amenities">
              {item.tags.map((tag) => (
                <span key={tag}>
                  <Check size={16} />
                  {tag}
                </span>
              ))}
            </div>
          </section>
        </div>
        <aside className="contact-card">
          <div className="detail-price">
            {item.price} €<span>/ mesečno{item.kind === 'roommate' ? ' · budžet' : ''}</span>
          </div>
          <p className="muted">
            {item.kind === 'room'
              ? 'Dogovor o računima i depozitu pri upoznavanju.'
              : 'Hajde da zajedno pronađemo dobar stan.'}
          </p>
          <div className="contact-person">
            <img src={item.avatar} alt={item.name} />
            <h3>
              {item.name}, {item.age}
              <small>{item.occupation}</small>
            </h3>
          </div>
          {item.authorBio && <p className="author-bio">{item.authorBio}</p>}
          <p>Jedna poruka može biti početak dobre priče.</p>
          <Button
            className="btn btn-primary full-width"
            onClick={() => {
              setSent(false)
              dialog.current?.showModal()
            }}
          >
            <MessageCircle size={18} />
            Javi se <ArrowUpRight size={18} />
          </Button>
          <span className="demo-caption">Demo profil · kontakt je simuliran</span>
          <hr />
          <p className="contact-tip">
            <Heart size={17} />
            Upoznajte se i dogovorite detalje pre useljenja.
          </p>
          <small>Objavljeno {new Intl.DateTimeFormat('sr-Latn-RS').format(new Date(item.createdAt))}</small>
        </aside>
      </div>
      <dialog
        ref={dialog}
        className="contact-dialog"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close()
        }}
      >
        <button className="dialog-close" aria-label="Zatvori" onClick={() => dialog.current?.close()}>
          <X size={20} />
        </button>
        {sent ? (
          <div className="sent-state">
            <span className="check-circle">
              <Check size={24} />
            </span>
            <h2>Prvi korak je napravljen!</h2>
            <p>Ovo je demo potvrda. Poruka nije poslata, jer aplikacija još nema backend.</p>
            <Button className="btn btn-primary" onClick={() => dialog.current?.close()}>
              Razumem
            </Button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setSent(true)
            }}
          >
            <span className="eyebrow">DOBRE PRIČE POČINJU PORUKOM</span>
            <h2>Javi se: {item.name}</h2>
            <p>Predstavi se i napiši šta te zanima o oglasu.</p>
            <label>
              Tvoja poruka
              <textarea
                required
                minLength={10}
                maxLength={1500}
                defaultValue={`Ćao ${item.name}, sviđa mi se tvoj oglas! Voleo/la bih da se upoznamo i saznam više.`}
              />
            </label>
            <Button className="btn btn-primary full-width" type="submit">
              Simuliraj slanje <ArrowUpRight size={18} />
            </Button>
            <small className="demo-caption">Demo režim — poruka se ne šalje stvarnoj osobi.</small>
          </form>
        )}
      </dialog>
    </div>
  )
}
