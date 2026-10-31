import { ImagePicker } from '@/components/media/image-picker'
import { useImageSelection } from '@/lib/use-image-selection'
import { cities } from '@/lib/cities'
import { apiMessage } from '@/lib/api-client'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowUpRight, Camera, Check, FileText, LockKeyhole, MapPin, Save, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { defaultAvatar, profileComplete } from '@/lib/profile-store'
import { useUpdateProfile } from '../api/use-users'
import type { User } from '../types'
const schema = z.object({
  name: z.string().trim().min(2, 'Unesi najmanje 2 znaka.').max(60, 'Najviše 60 znakova.'),
  age: z
    .number({ error: 'Unesi svoje godine.' })
    .int('Unesi cijeli broj.')
    .min(18, 'Minimalna starost je 18 godina.')
    .max(100, 'Unesi najviše 100.'),
  occupation: z.string().trim().min(2, 'Unesi svoje zanimanje.').max(100),
  city: z.string(),
  bio: z.string().trim().max(1000, 'Najviše 1.000 znakova.'),
})
type Fields = z.infer<typeof schema>
export function ProfileEditor({ user }: { user: User }) {
  const update = useUpdateProfile()
  const photos = useImageSelection(user.avatar === defaultAvatar ? [] : [user.avatar], 'avatar', 1)
  const [saved, setSaved] = useState(false)
  const [params] = useSearchParams()
  const next = params.get('next') || ''
  const returnPath = next === '/post' || /^\/listings\/\d+\/edit$/.test(next) ? next : null
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      age: user.age ?? undefined,
      occupation: user.occupation,
      city: user.city,
      bio: user.bio,
    },
  })
  const error = (key: keyof Fields) =>
    errors[key] && (
      <small className="field-error" role="alert">
        {errors[key]?.message}
      </small>
    )
  const cancel = () => {
    reset({ ...user, age: user.age ?? undefined })
    photos.reset(user.avatar === defaultAvatar ? [] : [user.avatar])
    setSaved(false)
    update.reset()
  }
  return (
    <div className="profile-layout profile-workspace">
      <aside className="profile-sidebar">
        <div className="profile-preview">
          <div className="profile-cover">
            <span>JAVNI IZGLED PROFILA</span>
          </div>
          <img className="profile-avatar" src={user.avatar} alt={`Profilna fotografija: ${user.name}`} />
          <h2>{user.name}</h2>
          <p>{user.occupation || 'Predstavi se budućim cimerima'}</p>
          {user.city && (
            <span className="profile-city">
              <MapPin size={13} />
              {user.city}
            </span>
          )}
          <span className={'profile-readiness ' + (profileComplete(user) ? 'is-complete' : '')}>
            <Check size={13} />
            {profileComplete(user) ? 'Spreman za nove početke' : 'Dopuni profil za objavljivanje'}
          </span>
          {user.bio && <p className="profile-bio">{user.bio}</p>}
          <div className="profile-note">
            <UserRound size={17} />
            <p>
              Ime, godine, zanimanje i fotografija prikazuju se uz tvoje oglase. Promjene se primjenjuju kada
              sačuvaš profil.
            </p>
          </div>
        </div>
        <Link className="profile-listings-link" to="/my-listings">
          <span>
            <strong>Tvoje mjesto za oglase</strong>
            <small>Pregledaj i uredi svoje objave</small>
          </span>
          <ArrowUpRight size={20} />
        </Link>
      </aside>
      <form
        className="profile-form"
        noValidate
        onChange={() => setSaved(false)}
        onSubmit={handleSubmit(async (values) => {
          try {
            const result = await update.mutateAsync({ ...values, avatar: photos.values[0] || defaultAvatar })
            reset({ ...result, age: result.age ?? undefined })
            photos.commit(result.avatar === defaultAvatar ? [] : [result.avatar])
            setSaved(true)
          } catch {
            /* Display a recoverable error below. */
          }
        })}
      >
        <fieldset disabled={update.isPending || photos.busy}>
          <section className="profile-editor-section">
            <header className="profile-section-heading">
              <span>
                <Camera size={18} />
              </span>
              <div>
                <h2>Lice iza profila</h2>
                <p>Jedna fotografija čini prvi susret mnogo ličnijim.</p>
              </div>
            </header>
            <ImagePicker selection={photos} disabled={update.isPending || photos.busy} />
          </section>
          <section className="profile-editor-section">
            <header className="profile-section-heading">
              <span>
                <UserRound size={18} />
              </span>
              <div>
                <h2>Za početak, nešto osnovno</h2>
                <p>Podaci koji pomažu budućim cimerima da te upoznaju.</p>
              </div>
            </header>
            <div className="form-grid">
              <label>
                Ime i prezime
                <Input autoComplete="name" {...register('name')} aria-invalid={!!errors.name} />
                {error('name')}
              </label>
              <label>
                Godine
                <Input
                  type="number"
                  min="18"
                  max="100"
                  {...register('age', { valueAsNumber: true })}
                  aria-invalid={!!errors.age}
                />
                {error('age')}
              </label>
              <label>
                Zanimanje
                <Input
                  placeholder="Npr. Student ili dizajner"
                  {...register('occupation')}
                  aria-invalid={!!errors.occupation}
                />
                {error('occupation')}
              </label>
              <label>
                Grad <span className="profile-optional">opciono</span>
                <select {...register('city')}>
                  <option value="">Izaberi grad</option>
                  {user.city && !cities.includes(user.city) && <option value={user.city}>{user.city}</option>}
                  {cities.map((city) => (
                    <option key={city}>{city}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>
          <section className="profile-editor-section">
            <header className="profile-section-heading">
              <span>
                <FileText size={18} />
              </span>
              <div>
                <h2>Tvoja priča</h2>
                <p>Dom dijelimo lakše kada znamo ponešto jedni o drugima.</p>
              </div>
            </header>
            <label>
              Nešto o tebi <span className="profile-optional">opciono</span>
              <Textarea
                rows={5}
                maxLength={1000}
                placeholder="Šta voliš, kakve su tvoje navike i kakav zajednički dom želiš?"
                {...register('bio')}
                aria-invalid={!!errors.bio}
              />
              {error('bio')}
            </label>
            <small className="profile-field-hint">
              Par riječi o svakodnevici, interesovanjima i tvom idealnom cimeru je dovoljno.
            </small>
          </section>
          <div className="profile-account-email">
            <LockKeyhole size={17} />
            <div>
              <strong>{user.email}</strong>
              <span>Email tvog naloga. Vidljiv je samo tebi.</span>
            </div>
          </div>
        </fieldset>
        {update.isError && (
          <p className="field-error" role="alert">
            {apiMessage(update.error)}
          </p>
        )}
        {saved && (
          <p className="profile-success" role="status">
            <Check size={17} />
            Profil je sačuvan. Podaci su ažurirani na tvojim oglasima.
          </p>
        )}
        <div className="profile-form-actions">
          <button
            className="btn btn-outline"
            type="button"
            onClick={cancel}
            disabled={update.isPending || photos.busy}
          >
            Odustani od izmjena
          </button>
          <Button className="btn btn-primary" type="submit" disabled={update.isPending || photos.busy}>
            <Save size={17} />
            {update.isPending ? 'Čuvam...' : 'Sačuvaj profil'}
          </Button>
        </div>
        {returnPath && profileComplete(user) && (
          <Link className="btn btn-outline full-width" to={returnPath}>
            {returnPath === '/post' ? 'Nastavi na objavljivanje oglasa →' : 'Vrati se na uređivanje oglasa →'}
          </Link>
        )}
      </form>
    </div>
  )
}
