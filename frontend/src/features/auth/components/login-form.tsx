import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router'
import { ArrowUpRight, Heart, House } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiMessage } from '@/lib/api-client'
import { useCurrentUserState } from '@/lib/use-current-user'
import { SignOutDialog } from '@/components/layout/sign-out-dialog'
import { SessionStatus } from '@/components/layout/session-status'
import { useRegister, useSignIn } from '../api/use-auth'
export function LoginForm() {
  const { user, isPending, isError, error, refetch } = useCurrentUserState()
  const [confirmSignOut, setConfirmSignOut] = useState(false)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const signingUp = mode === 'register'
  const login = useSignIn()
  const signup = useRegister()
  const mutation = signingUp ? signup : login
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const schema = z
    .object({
      email: z.email('Unesi ispravnu email adresu.'),
      password: z.string().min(1, 'Unesi lozinku.'),
      displayName: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      if (
        signingUp &&
        (!values.displayName || values.displayName.trim().length < 2 || values.displayName.trim().length > 60)
      )
        ctx.addIssue({
          code: 'custom',
          path: ['displayName'],
          message: 'Ime treba da ima između 2 i 60 znakova.',
        })
      if (signingUp && values.password.length < 8)
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: 'Lozinka treba da ima najmanje 8 znakova.',
        })
      if (new TextEncoder().encode(values.password).length > 72)
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: 'Lozinka je predugačka. Koristi najviše 72 UTF-8 bajta.',
        })
    })
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })
  if (isPending || isError)
    return <SessionStatus error={isError ? error : undefined} retry={() => refetch()} />
  return (
    <section className="container login-page">
      <SignOutDialog open={confirmSignOut} onClose={() => setConfirmSignOut(false)} />
      <div className="login-story">
        <span className="eyebrow">TVOJI LJUDI TE ČEKAJU</span>
        <h1>
          Svaki novi početak
          <br />
          je lakši <span>zajedno.</span>
        </h1>
        <p>
          Pronađi sobu u kojoj možeš da budeš svoj.
          <br />I ljude uz koje se osjećaš kao kod kuće.
        </p>
        <img
          src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85"
          alt="Prijatan dnevni boravak za zajedničke trenutke"
        />
        <div className="login-story-note">
          <Heart size={20} />
          Manje traženja. Više pripadanja.
        </div>
      </div>
      <div className="login-form-wrap">
        {user ? (
          <div className="signed-in">
            <span className="advice-icon">
              <House size={28} />
            </span>
            <h2>Ćao, {user.name}!</h2>
            <p>Tvoj profil i oglasi čekaju te na jednom mjestu.</p>
            <Link className="btn btn-primary" to="/profile">
              Moj profil <ArrowUpRight size={18} />
            </Link>
            <button className="text-link" onClick={() => setConfirmSignOut(true)}>
              Odjavi se
            </button>
          </div>
        ) : (
          <>
            <div className="auth-tabs" aria-label="Prijava ili registracija">
              {(['login', 'register'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={mode === value}
                  className={mode === value ? 'active' : ''}
                  disabled={mutation.isPending}
                  onClick={() => {
                    setMode(value)
                    reset({ ...getValues(), password: '' })
                    login.reset()
                    signup.reset()
                  }}
                >
                  {value === 'login' ? 'Prijava' : 'Registracija'}
                </button>
              ))}
            </div>
            <h2>{signingUp ? 'Napravi svoj nalog.' : 'Lijepo je vidjeti te.'}</h2>
            <p>
              {signingUp
                ? 'Predstavi se i započni svoju novu priču.'
                : 'Prijavi se i napravi korak bliže svom novom domu.'}
            </p>
            <form
              noValidate
              onSubmit={handleSubmit(async (values) => {
                try {
                  if (signingUp)
                    await signup.mutateAsync({
                      email: values.email,
                      password: values.password,
                      displayName: values.displayName?.trim() || '',
                    })
                  else await login.mutateAsync({ email: values.email, password: values.password })
                  const next = params.get('next') || ''
                  navigate(
                    ['/post', '/profile', '/my-listings', '/messages'].includes(next) ||
                      /^\/listings\/\d+(?:\/edit)?$/.test(next)
                      ? next
                      : '/',
                    {
                      replace: true,
                    },
                  )
                } catch {
                  /* The request error is shown below. */
                }
              })}
            >
              <fieldset disabled={mutation.isPending}>
                {signingUp && (
                  <label>
                    Ime i prezime
                    <Input
                      autoComplete="name"
                      maxLength={60}
                      {...register('displayName')}
                      aria-invalid={!!errors.displayName}
                    />
                    {errors.displayName && (
                      <small className="field-error" role="alert">
                        {errors.displayName.message}
                      </small>
                    )}
                  </label>
                )}
                <label>
                  Email adresa
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="tvoje.ime@email.com"
                    {...register('email')}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <small className="field-error" role="alert">
                      {errors.email.message}
                    </small>
                  )}
                </label>
                <label>
                  Lozinka
                  <div className="password-field">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={signingUp ? 'new-password' : 'current-password'}
                      placeholder={signingUp ? 'Najmanje 8 znakova' : 'Tvoja lozinka'}
                      {...register('password')}
                      aria-invalid={!!errors.password}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? 'Sakrij' : 'Prikaži'}
                    </button>
                  </div>
                  {errors.password && (
                    <small className="field-error" role="alert">
                      {errors.password.message}
                    </small>
                  )}
                </label>
                {mutation.isError && (
                  <p className="field-error" role="alert">
                    {apiMessage(mutation.error)}
                  </p>
                )}
                <Button className="btn btn-primary full-width" type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Sačekaj...' : signingUp ? 'Napravi nalog' : 'Prijavi se'}{' '}
                  <ArrowUpRight size={18} />
                </Button>
              </fieldset>
            </form>
            <div className="demo-box">
              <strong>{signingUp ? 'Tvoj profil, tvoji oglasi' : 'Prvi put ovdje?'}</strong>
              <p>
                {signingUp
                  ? 'Nakon registracije dopuni profil da bi mogao/la objaviti svoj prvi oglas.'
                  : 'Napravi nalog, sačuvaj omiljene oglase i upoznaj buduće cimere.'}
              </p>
            </div>
            <Link className="text-link" to="/listings">
              Za sada samo razgledam →
            </Link>
          </>
        )}
      </div>
    </section>
  )
}
