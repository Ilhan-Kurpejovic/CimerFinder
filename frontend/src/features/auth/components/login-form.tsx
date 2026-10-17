import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { ArrowUpRight, Heart, House } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLocalState } from '@/lib/use-local-state'
const schema = z.object({
  email: z.email('Unesi ispravnu email adresu.'),
  password: z.string().min(6, 'Lozinka treba da ima najmanje 6 znakova.'),
})
export function LoginForm() {
  const [user, setUser] = useLocalState<{ name: string; email: string } | null>('cimer-user', null)
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })
  return (
    <section className="container login-page">
      <div className="login-story">
        <span className="eyebrow">TVOJI LJUDI TE ČEKAJU</span>
        <h1>
          Svaki novi početak
          <br />
          je lakši <span>zajedno.</span>
        </h1>
        <p>
          Pronađi sobu u kojoj možeš da budeš svoj.
          <br />I ljude uz koje se osećaš kao kod kuće.
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
            <p>Prijavljen/a si u demo režimu.</p>
            <Link className="btn btn-primary" to="/listings">
              Istraži oglase <ArrowUpRight size={18} />
            </Link>
            <button className="text-link" onClick={() => setUser(null)}>
              Odjavi se
            </button>
          </div>
        ) : (
          <>
            <span className="advice-icon">
              <House size={27} />
            </span>
            <h2>Lepo je videti te.</h2>
            <p>Prijavi se i napravi korak bliže svom novom domu.</p>
            <form
              onSubmit={handleSubmit((values) => {
                const raw = values.email.split('@')[0]
                setUser({ name: raw.charAt(0).toUpperCase() + raw.slice(1), email: values.email })
                navigate('/listings')
              })}
              noValidate
            >
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
                    autoComplete="current-password"
                    placeholder="Najmanje 6 znakova"
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
              <Button className="btn btn-primary full-width" type="submit">
                Prijavi se <ArrowUpRight size={18} />
              </Button>
            </form>
            <div className="demo-box">
              <strong>Isprobaj bez registracije</strong>
              <p>
                Unesi bilo koju ispravnu email adresu i lozinku od najmanje 6 znakova. Ovo je demo prijava;
                lozinka se ne čuva.
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
