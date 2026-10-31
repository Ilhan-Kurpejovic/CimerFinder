import { roommateTags, personalTags } from '../lib/roommate-options'
import { useImageSelection } from '@/lib/use-image-selection'
import { ImagePicker } from '@/components/media/image-picker'
import { cities } from '@/lib/cities'
import { apiMessage } from '@/lib/api-client'
import { SessionStatus } from '@/components/layout/session-status'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, ArrowUpRight, Heart, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCurrentUserState } from '@/lib/use-current-user'
import { profileComplete } from '@/lib/profile-store'
import { useCreateListing, useUpdateListing } from '../api/use-listings'
import type { Listing } from '../types'
const schema = z
  .object({
    kind: z.enum(['room', 'roommate']),
    title: z.string().trim().min(8, 'Unesi naslov sa najmanje 8 znakova.').max(90, 'Najviše 90 znakova.'),
    city: z.string().min(1, 'Izaberi grad.'),
    neighborhood: z.string().trim().max(100, 'Najviše 100 znakova.'),
    price: z.number().min(1, 'Unesi iznos veći od 0.').max(5000, 'Maksimalni iznos je 5.000 €.'),
    area: z.number({ error: 'Unesi površinu.' }).int('Unesi cijeli broj.').min(1, 'Unesi površinu.').max(500),
    roommates: z.number({ error: 'Unesi broj cimera.' }).int('Unesi cijeli broj.').min(1).max(10),
    description: z.string().trim().min(40, 'Napiši najmanje 40 znakova.').max(3000),
  })
  .superRefine((values, context) => {
    if (values.neighborhood.length < 2 && (values.kind === 'room' || values.neighborhood.length > 0))
      context.addIssue({
        code: 'custom',
        path: ['neighborhood'],
        message: 'Unesi najmanje 2 znaka za naselje.',
      })
  })
type Fields = z.infer<typeof schema>
const tags = ['Namješteno', 'Pet friendly', 'Terasa', 'Wi-Fi', 'Rad od kuće', 'Ne pušim', 'Blizu fakulteta']
export function ListingForm({ listing }: { listing?: Listing }) {
  const navigate = useNavigate()
  const create = useCreateListing()
  const update = useUpdateListing()
  const editing = !!listing
  const returnPath = listing ? `/listings/${listing.id}/edit` : '/post'
  const {
    user,
    isPending: sessionPending,
    isError: sessionError,
    error: sessionErrorValue,
    refetch: retrySession,
  } = useCurrentUserState()
  const [selected, setSelected] = useState<string[]>(listing?.tags ?? ['Wi-Fi'])
  const photos = useImageSelection(
    listing?.kind === 'room'
      ? listing.imageUrls || (listing.imageUrl === '/room-placeholder.svg' ? [] : [listing.imageUrl])
      : [],
    'listing',
    8,
  )
  const busy = create.isPending || update.isPending || photos.busy
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: listing
      ? {
          kind: listing.kind,
          title: listing.title,
          city: listing.city,
          neighborhood: listing.neighborhood,
          price: listing.price,
          area: listing.area || 15,
          roommates: listing.roommates,
          description: listing.description,
        }
      : { kind: 'room', roommates: 1, area: 15 },
  })
  const isRoommate = watch('kind') === 'roommate'
  const chosenTags = isRoommate ? personalTags(selected) : selected
  useEffect(() => {
    if (isRoommate) setValue('area', listing?.area || 15)
  }, [isRoommate, listing?.area, setValue])
  const fieldError = (field: keyof Fields) =>
    errors[field] ? (
      <small className="field-error" role="alert">
        {errors[field]?.message}
      </small>
    ) : null
  const submit = handleSubmit(async (values) => {
    if (!profileComplete(user)) return
    try {
      const imageUrls = values.kind === 'room' ? photos.values : []
      const changes = {
        ...values,
        neighborhood: values.neighborhood.trim() || 'Po dogovoru',
        tags: chosenTags,
        imageUrl: imageUrls[0] || '',
        imageUrls,
      }
      const item = listing
        ? await update.mutateAsync({ id: listing.id, changes })
        : await create.mutateAsync({
            ...changes,
            userId: user.id,
            name: user.name,
            age: user.age,
            occupation: user.occupation,
            avatar: user.avatar,
          })
      photos.commit(item.kind === 'room' ? item.imageUrls || [] : [])
      navigate(`/listings/${item.id}`, { state: { listingUpdated: editing ? item.id : null } })
    } catch {
      /* The mutation exposes a recoverable error below. */
    }
  })
  if (sessionPending || sessionError)
    return <SessionStatus error={sessionError ? sessionErrorValue : undefined} retry={() => retrySession()} />
  if (!user)
    return (
      <div className="container page-content">
        <div className="empty-state">
          <h1>Prijavi se i objavi svoj oglas.</h1>
          <p>Tako će oglas biti povezan sa tvojim profilom.</p>
          <Link className="btn btn-primary" to="/login?next=/post">
            Prijavi se
          </Link>
        </div>
      </div>
    )
  if (!profileComplete(user))
    return (
      <div className="container page-content">
        <div className="empty-state">
          <h1>Prvo se predstavi budućim cimerima.</h1>
          <p>
            Sačuvaj ime, godine i zanimanje na svom profilu. Oglasi će automatski preuzeti te podatke i tvoju
            profilnu fotografiju.
          </p>
          <Link className="btn btn-primary" to={`/profile?next=${returnPath}`}>
            Dopuni profil
          </Link>
        </div>
      </div>
    )
  return (
    <div className="container page-content">
      <Link className="back-link" to={listing ? `/listings/${listing.id}` : '/listings'}>
        <ArrowLeft size={16} />
        {editing ? 'Nazad na oglas' : 'Nazad na oglase'}
      </Link>
      <div className="page-intro">
        <span className="eyebrow">
          {editing ? 'TVOJ OGLAS, UVIJEK AŽURAN' : 'NAPRAVI MJESTO ZA NOVU PRIČU'}
        </span>
        <h1>{editing ? 'Uredi svoj oglas.' : 'Pronađi svog sljedećeg cimera.'}</h1>
        <p>
          {editing
            ? 'Ažuriraj cijenu, opis ili fotografiju. Izmjene se prikazuju čim ih sačuvaš.'
            : 'Predstavi svoj prostor ili sebe. Objavljivanje je besplatno.'}
        </p>
      </div>
      <div className="form-layout">
        <form className="post-form" onSubmit={submit} noValidate>
          <fieldset disabled={busy}>
            <section>
              <h2>
                <span>01</span>Za početak, šta tražiš?
              </h2>
              <div className="kind-options">
                <label className={watch('kind') === 'room' ? 'selected' : ''}>
                  <input type="radio" value="room" {...register('kind')} />
                  <strong>Imam slobodnu sobu</strong>
                  <small>Tražim nekoga da dijelimo dom.</small>
                </label>
                <label className={watch('kind') === 'roommate' ? 'selected' : ''}>
                  <input type="radio" value="roommate" {...register('kind')} />
                  <strong>Tražim cimera i stan</strong>
                  <small>Hajde da pronađemo dom zajedno.</small>
                </label>
              </div>
            </section>
            {isRoommate && (
              <div className="roommate-form-profile">
                <img src={user.avatar} alt={'Profilna fotografija: ' + user.name} />
                <div>
                  <span className="eyebrow">OVO SI TI</span>
                  <h3>
                    {user.name}, {user.age}
                  </h3>
                  <p>
                    {user.occupation}
                    {user.city ? ' · ' + user.city : ''}
                  </p>
                  {user.bio && <p className="roommate-form-bio">{user.bio}</p>}
                  <Link className="text-link" to={`/profile?next=${returnPath}`}>
                    Uredi fotografiju i podatke na profilu →
                  </Link>
                </div>
              </div>
            )}
            <section>
              <h2>
                <span>02</span>
                {isRoommate ? 'Kakav dom i cimera tražiš?' : 'Detalji koji znače'}
              </h2>
              <label>
                Naslov oglasa
                <Input
                  placeholder={
                    isRoommate
                      ? 'Npr. Tražim miran dom i cimera za zajednički stan'
                      : 'Npr. Svijetla soba i opuštena ekipa na Vračaru'
                  }
                  {...register('title')}
                  aria-invalid={!!errors.title}
                />
                {fieldError('title')}
              </label>
              <div className="form-grid">
                <label>
                  Grad
                  <select {...register('city')}>
                    <option value="">Izaberi grad</option>
                    {listing?.city && !cities.includes(listing.city) && (
                      <option value={listing.city}>{listing.city}</option>
                    )}
                    {cities.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  {fieldError('city')}
                </label>
                <label>
                  {isRoommate ? 'Željeno naselje (opciono)' : 'Naselje'}
                  <Input
                    placeholder={isRoommate ? 'Otvoren/a sam za dogovor' : 'Npr. Vračar'}
                    {...register('neighborhood')}
                  />
                  {fieldError('neighborhood')}
                </label>
                <label>
                  {isRoommate ? 'Budžet za moj dio stanarine (€)' : 'Mjesečna kirija (€)'}
                  <Input
                    type="number"
                    min="1"
                    {...register('price', { valueAsNumber: true })}
                    placeholder="280"
                  />
                  {fieldError('price')}
                </label>
                {!isRoommate && (
                  <label>
                    Površina sobe (m²)
                    <Input type="number" min="1" {...register('area', { valueAsNumber: true })} />
                    {fieldError('area')}
                  </label>
                )}
                <label>
                  {isRoommate ? 'Koliko cimera tražiš?' : 'Broj cimera'}
                  <Input type="number" min="1" max="10" {...register('roommates', { valueAsNumber: true })} />
                  {fieldError('roommates')}
                </label>
              </div>
              <label>
                {isRoommate ? 'Kako zamišljaš zajednički dom?' : 'Opiši svoj prostor i idealnog cimera'}
                <Textarea
                  rows={5}
                  placeholder={
                    isRoommate
                      ? 'Kakvog cimera tražiš, kada želiš da se useliš i šta ti je važno pri zajedničkom životu? Tvoja biografija se već preuzima sa profila.'
                      : 'Kakva je atmosfera? Šta voliš, šta ti je važno i kada je moguće useljenje?'
                  }
                  {...register('description')}
                />
                {fieldError('description')}
              </label>
              <label>{isRoommate ? 'Tvoje navike i način života' : 'Šta najbolje opisuje tvoj oglas?'}</label>
              <div className="tag-options">
                {[...new Set([...(isRoommate ? roommateTags : tags), ...chosenTags])].map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    aria-pressed={chosenTags.includes(tag)}
                    className={chosenTags.includes(tag) ? 'selected' : ''}
                    onClick={() =>
                      setSelected(
                        selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag],
                      )
                    }
                  >
                    {chosenTags.includes(tag) && <Check size={13} />}
                    {tag}
                  </button>
                ))}
              </div>
              {!isRoommate && (
                <ImagePicker selection={photos} disabled={create.isPending || update.isPending} />
              )}
            </section>
            {!isRoommate && (
              <section>
                <h2>
                  <span>03</span>Upoznajmo se
                </h2>
                <div className="author-preview">
                  <img src={user.avatar} alt={user.name} />
                  <div>
                    <strong>
                      {user.name}, {user.age}
                    </strong>
                    <p>{user.occupation}</p>
                    <Link className="text-link" to={`/profile?next=${returnPath}`}>
                      Uredi podatke na profilu →
                    </Link>
                  </div>
                </div>
                <p className="muted">Podaci o autoru se automatski preuzimaju sa profila.</p>
              </section>
            )}
            {(create.isError || update.isError) && (
              <p className="field-error" role="alert">
                {apiMessage(update.error || create.error)}
              </p>
            )}
            <div className="form-submit">
              <p>Oglas se čuva na tvom nalogu.</p>
              <div className="listing-form-buttons">
                {listing && (
                  <button
                    className="btn btn-outline"
                    type="button"
                    disabled={busy}
                    onClick={() => navigate(`/listings/${listing.id}`)}
                  >
                    Odustani
                  </button>
                )}
                <Button className="btn btn-primary" type="submit" disabled={busy}>
                  {busy ? 'Čuvam...' : editing ? 'Sačuvaj izmjene' : 'Objavi oglas'}
                  <ArrowUpRight size={18} />
                </Button>
              </div>
            </div>
          </fieldset>
        </form>
        <aside className="form-advice">
          <span className="advice-icon">
            <Heart size={26} />
          </span>
          <h2>Dobar oglas privlači dobre ljude.</h2>
          <p>Najbolje priče počinju iskrenim predstavljanjem.</p>
          <ul>
            <li>
              <Check size={17} />
              {isRoommate
                ? 'Dodaj profilnu fotografiju kroz Moj profil.'
                : 'Dodaj jasnu fotografiju prostora.'}
            </li>
            <li>
              <Check size={17} />
              {isRoommate ? 'Navedi svoj budžet i željeni grad.' : 'Napiši šta je uključeno u cijenu.'}
            </li>
            <li>
              <Check size={17} />
              Podijeli svoje navike i interesovanja.
            </li>
            <li>
              <Check size={17} />
              Opiši kakvog cimera tražiš.
            </li>
          </ul>
          <div className="advice-bottom">Tvoj novi cimer je možda baš sada u potrazi.</div>
        </aside>
      </div>
    </div>
  )
}
