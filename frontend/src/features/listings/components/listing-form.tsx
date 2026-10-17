import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, ArrowUpRight, ImagePlus, Heart, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCurrentUser } from '@/lib/use-current-user'
import { profileComplete } from '@/lib/profile-store'
import { useCreateListing } from '../api/use-listings'
const schema = z.object({
  kind: z.enum(['room', 'roommate']),
  title: z.string().trim().min(8, 'Unesi naslov sa najmanje 8 znakova.').max(90, 'Najviše 90 znakova.'),
  city: z.string().min(1, 'Izaberi grad.'),
  neighborhood: z.string().trim().min(2, 'Unesi naselje.'),
  price: z.number().min(1, 'Unesi iznos veći od 0.').max(5000, 'Maksimalni iznos je 5.000 €.'),
  area: z.number().min(1, 'Unesi površinu.').max(500),
  roommates: z.number().min(1).max(10),
  description: z.string().trim().min(40, 'Napiši najmanje 40 znakova.').max(3000),
})
type Fields = z.infer<typeof schema>
const tags = ['Namešteno', 'Pet friendly', 'Terasa', 'Wi-Fi', 'Rad od kuće', 'Ne pušim', 'Blizu fakulteta']
export function ListingForm() {
  const navigate = useNavigate()
  const create = useCreateListing()
  const user = useCurrentUser()
  const [selected, setSelected] = useState<string[]>(['Wi-Fi'])
  const [image, setImage] = useState('')
  const [imageError, setImageError] = useState('')
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { kind: 'room', roommates: 1, area: 15 },
  })
  const fieldError = (field: keyof Fields) =>
    errors[field] ? (
      <small className="field-error" role="alert">
        {errors[field]?.message}
      </small>
    ) : null
  const submit = handleSubmit(async (values) => {
    if (!profileComplete(user)) return
    try {
      const item = await create.mutateAsync({
        ...values,
        userId: user.id,
        name: user.name,
        age: user.age,
        occupation: user.occupation,
        tags: selected,
        imageUrl:
          image ||
          (values.kind === 'room'
            ? 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85'
            : user.avatar),
        avatar: user.avatar,
      })
      navigate(`/listings/${item.id}`)
    } catch {
      /* The mutation exposes a recoverable error below. */
    }
  })
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
          <Link className="btn btn-primary" to="/profile?next=/post">
            Dopuni profil
          </Link>
        </div>
      </div>
    )
  return (
    <div className="container page-content">
      <Link className="back-link" to="/listings">
        <ArrowLeft size={16} />
        Nazad na oglase
      </Link>
      <div className="page-intro">
        <span className="eyebrow">NAPRAVI MESTO ZA NOVU PRIČU</span>
        <h1>Pronađi svog sledećeg cimera.</h1>
        <p>Predstavi svoj prostor ili sebe. Objavljivanje je besplatno.</p>
      </div>
      <div className="form-layout">
        <form className="post-form" onSubmit={submit} noValidate>
          <section>
            <h2>
              <span>01</span>Za početak, šta tražiš?
            </h2>
            <div className="kind-options">
              <label className={watch('kind') === 'room' ? 'selected' : ''}>
                <input type="radio" value="room" {...register('kind')} />
                <strong>Imam slobodnu sobu</strong>
                <small>Tražim nekoga da delimo dom.</small>
              </label>
              <label className={watch('kind') === 'roommate' ? 'selected' : ''}>
                <input type="radio" value="roommate" {...register('kind')} />
                <strong>Tražim cimera i stan</strong>
                <small>Hajde da pronađemo dom zajedno.</small>
              </label>
            </div>
          </section>
          <section>
            <h2>
              <span>02</span>Detalji koji znače
            </h2>
            <label>
              Naslov oglasa
              <Input
                placeholder="Npr. Svetla soba i opuštena ekipa na Vračaru"
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
                  {['Beograd', 'Novi Sad', 'Niš', 'Kragujevac'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                {fieldError('city')}
              </label>
              <label>
                Naselje
                <Input placeholder="Npr. Vračar" {...register('neighborhood')} />
                {fieldError('neighborhood')}
              </label>
              <label>
                {watch('kind') === 'room' ? 'Mesečna kirija (€)' : 'Mesečni budžet (€)'}
                <Input
                  type="number"
                  min="1"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="280"
                />
                {fieldError('price')}
              </label>
              <label>
                {watch('kind') === 'room' ? 'Površina sobe (m²)' : 'Željena površina sobe (m²)'}
                <Input type="number" min="1" {...register('area', { valueAsNumber: true })} />
                {fieldError('area')}
              </label>
              <label>
                Broj cimera
                <Input type="number" min="1" max="10" {...register('roommates', { valueAsNumber: true })} />
                {fieldError('roommates')}
              </label>
            </div>
            <label>
              Opiši svoj prostor i idealnog cimera
              <Textarea
                rows={5}
                placeholder="Kakva je atmosfera? Šta voliš, šta ti je važno i kada je moguće useljenje?"
                {...register('description')}
              />
              {fieldError('description')}
            </label>
            <label>Šta najbolje opisuje tvoj oglas?</label>
            <div className="tag-options">
              {tags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  aria-pressed={selected.includes(tag)}
                  className={selected.includes(tag) ? 'selected' : ''}
                  onClick={() =>
                    setSelected(
                      selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag],
                    )
                  }
                >
                  {selected.includes(tag) && <Check size={13} />}
                  {tag}
                </button>
              ))}
            </div>
            {watch('kind') === 'room' ? (
              <>
                <label className="upload-zone">
                  <ImagePlus size={26} />
                  <strong>{image ? 'Promeni fotografiju' : 'Dodaj fotografiju'}</strong>
                  <span>JPG, PNG ili WebP · do 2 MB</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (
                        file.size > 2 * 1024 * 1024 ||
                        !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
                      ) {
                        setImageError('Izaberi JPG, PNG ili WebP do 2 MB.')
                        return
                      }
                      setImageError('')
                      const reader = new FileReader()
                      reader.onload = () => setImage(String(reader.result))
                      reader.readAsDataURL(file)
                    }}
                  />
                </label>
                {image && <img className="upload-preview" src={image} alt="Pregled izabrane fotografije" />}
                {imageError && (
                  <small className="field-error" role="alert">
                    {imageError}
                  </small>
                )}
                <small className="muted">Bez fotografije koristi se ilustrativna demo fotografija.</small>
              </>
            ) : (
              <div className="author-preview">
                <img src={user.avatar} alt={user.name} />
                <p>Ovaj oglas koristi tvoju profilnu fotografiju. Možeš je promeniti na profilu.</p>
              </div>
            )}
          </section>
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
                <Link className="text-link" to="/profile?next=/post">
                  Uredi podatke na profilu →
                </Link>
              </div>
            </div>
            <p className="muted">Podaci o autoru se automatski preuzimaju sa profila.</p>
          </section>
          {create.isError && (
            <p className="field-error" role="alert">
              Čuvanje nije uspelo. Proveri slobodan prostor pregledača ili izaberi manju sliku, pa pokušaj
              ponovo.
            </p>
          )}
          <div className="form-submit">
            <p>Demo oglas čuva se samo u ovom pregledaču.</p>
            <Button className="btn btn-primary" type="submit" disabled={create.isPending}>
              {create.isPending ? 'Objavljujem...' : 'Objavi oglas'}
              <ArrowUpRight size={18} />
            </Button>
          </div>
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
              Dodaj jasnu fotografiju prostora.
            </li>
            <li>
              <Check size={17} />
              Napiši šta je uključeno u cenu.
            </li>
            <li>
              <Check size={17} />
              Podeli svoje navike i interesovanja.
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
