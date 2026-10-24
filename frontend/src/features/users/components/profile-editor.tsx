import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Camera, Check, Save, X } from 'lucide-react'
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
  const [avatar, setAvatar] = useState(user.avatar)
  const [imageError, setImageError] = useState('')
  const [reading, setReading] = useState(false)
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
    setAvatar(user.avatar)
    setImageError('')
    setSaved(false)
    update.reset()
  }
  return (
    <div className="profile-layout">
      <aside className="profile-preview">
        <img className="profile-avatar" src={user.avatar} alt={`Profilna fotografija: ${user.name}`} />
        <h2>{user.name}</h2>
        <p>{user.occupation || 'Dopuni svoj profil'}</p>
        <span>{user.city}</span>
        <small>{user.email}</small>
        {user.bio && <p className="profile-bio">{user.bio}</p>}
        <div className="profile-note">
          <Check size={18} />
          <p>
            Ime, godine, zanimanje i profilna slika automatski se prikazuju uz tvoje oglase. Fotografije stana
            ostaju zasebne.
          </p>
        </div>
      </aside>
      <form
        className="post-form profile-form"
        noValidate
        onChange={() => setSaved(false)}
        onSubmit={handleSubmit(async (values) => {
          try {
            const result = await update.mutateAsync({ ...values, avatar })
            reset({ ...result, age: result.age ?? undefined })
            setSaved(true)
          } catch {
            /* Display a recoverable error below. */
          }
        })}
      >
        <h2>Uredi profil</h2>
        <fieldset disabled={update.isPending || reading}>
          <div className="profile-photo-editor">
            <img src={avatar} alt="Pregled profilne fotografije" />
            <div>
              <label className="btn btn-outline photo-upload">
                <Camera size={17} />
                Promijeni fotografiju
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (!file) return
                    setSaved(false)
                    if (
                      file.size > 2 * 1024 * 1024 ||
                      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
                    ) {
                      setImageError('Izaberi JPG, PNG ili WebP do 2 MB.')
                      return
                    }
                    setImageError('')
                    setReading(true)
                    const reader = new FileReader()
                    reader.onload = () => {
                      setAvatar(String(reader.result))
                      setReading(false)
                    }
                    reader.onerror = () => {
                      setImageError('Fotografija nije učitana. Pokušaj ponovo.')
                      setReading(false)
                    }
                    reader.readAsDataURL(file)
                  }}
                />
              </label>
              <small>JPG, PNG ili WebP · do 2 MB</small>
              {avatar !== defaultAvatar && (
                <button
                  className="text-link remove-photo"
                  type="button"
                  onClick={() => {
                    setAvatar(defaultAvatar)
                    setSaved(false)
                  }}
                >
                  <X size={12} />
                  Ukloni fotografiju
                </button>
              )}
            </div>
          </div>
          {imageError && (
            <p className="field-error" role="alert">
              {imageError}
            </p>
          )}
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
              Grad
              <select {...register('city')}>
                <option value="">Izaberi grad (opciono)</option>
                {['Beograd', 'Novi Sad', 'Niš', 'Kragujevac'].map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Nešto o tebi
            <Textarea
              rows={4}
              placeholder="Šta voliš, kakve su tvoje navike i kakav zajednički dom želiš?"
              {...register('bio')}
            />
            {error('bio')}
          </label>
          <label>
            Email adresa
            <Input type="email" value={user.email} disabled />
            <small className="muted">Email povezuje ovaj demo profil sa tvojim oglasima.</small>
          </label>
        </fieldset>
        {update.isError && (
          <p className="field-error" role="alert">
            Profil nije sačuvan. Provjeri prostor pregledača ili izaberi manju fotografiju i pokušaj ponovo.
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
            disabled={update.isPending || reading}
          >
            Odustani od izmjena
          </button>
          <Button className="btn btn-primary" type="submit" disabled={update.isPending || reading}>
            <Save size={17} />
            {reading ? 'Učitavam fotografiju...' : update.isPending ? 'Čuvam...' : 'Sačuvaj profil'}
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
