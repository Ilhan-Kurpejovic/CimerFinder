import { cities } from '@/lib/cities'
import { Link, useNavigate } from 'react-router'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Heart,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { useListings } from '../api/use-listings'
import { ListingsList } from './listings-list'
export function HomeContent() {
  const navigate = useNavigate()
  const [kind, setKind] = useState('room')
  const [city, setCity] = useState('')
  const [budget, setBudget] = useState('')
  const { data = [], isPending, isError, refetch } = useListings('', { kind: 'room', size: 3 })
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              <span />
              NOVI LJUDI. NOVI POČECI.
            </span>
            <h1>
              Pronađi svoj prostor.
              <br />I svoje{' '}
              <span>
                ljude.
                <svg viewBox="0 0 200 15" aria-hidden="true">
                  <path d="M3 10 Q95 -3 195 8 M28 14 Q100 5 176 12" />
                </svg>
              </span>
            </h1>
            <p>
              Više od sobe. Više od cimera.
              <br />
              Mjesto gdje tvoj novi život počinje — uz prave ljude.
            </p>
            <div className="hero-social">
              <div className="avatar-stack">
                {[47, 12, 44, 13].map((id) => (
                  <img key={id} src={`https://i.pravatar.cc/64?img=${id}`} alt="" />
                ))}
              </div>
              <div>
                <strong>Bolje je kad dijelimo.</strong>
                <span>Pronađi ljude uz koje si kod kuće.</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-photo">
              <img
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1100&q=90"
                alt="Svijetao dnevni boravak sa udobnom sofom i prirodnim detaljima"
              />
              <span className="image-note">
                <span />
                Tvoj novi početak je ovdje
              </span>
            </div>
            <div className="float-card match-card">
              <span className="match-icon">
                <Heart size={21} />
              </span>
              <div>
                Dobri cimeri.<strong>Još bolji dani.</strong>
              </div>
              <Sparkles size={18} />
            </div>
            <div className="float-card home-card">
              <span className="check-circle">
                <Check size={17} />
              </span>
              <div>
                Osjećaj kao kod kuće.<small>Od prvog dana.</small>
              </div>
            </div>
            <span className="hero-doodle" aria-hidden="true">
              ✳
            </span>
          </div>
        </div>
        <div className="container">
          <div className="search-panel">
            <div className="search-tabs">
              <button className={kind === 'room' ? 'active' : ''} onClick={() => setKind('room')}>
                Tražim sobu
              </button>
              <button className={kind === 'roommate' ? 'active' : ''} onClick={() => setKind('roommate')}>
                Tražim cimera
              </button>
            </div>
            <form
              className="hero-search"
              onSubmit={(e) => {
                e.preventDefault()
                navigate(
                  `/${kind === 'room' ? 'listings' : 'roommates'}?city=${encodeURIComponent(city)}&budget=${budget}`,
                )
              }}
            >
              <label>
                <MapPin size={20} />
                <span>
                  Gdje želiš da živiš?
                  <select value={city} onChange={(e) => setCity(e.target.value)}>
                    <option value="">Izaberi grad</option>
                    {cities.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </span>
              </label>
              <label className="budget-search">
                <span className="currency-icon">€</span>
                <span>
                  Tvoj mjesečni budžet
                  <select value={budget} onChange={(e) => setBudget(e.target.value)}>
                    <option value="">Izaberi budžet</option>
                    <option value="200">Do 200 €</option>
                    <option value="300">Do 300 €</option>
                    <option value="400">Do 400 €</option>
                    <option value="600">Do 600 €</option>
                  </select>
                </span>
              </label>
              <button className="btn btn-primary search-submit">
                <Search size={19} />
                Pronađi svoj dom <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      </section>
      <div className="container trust-strip">
        <span>
          <ShieldCheck size={18} />
          Profili sa licem i pričom
        </span>
        <span>
          <Users size={18} />
          Ljudi slični tebi
        </span>
        <span>
          <Heart size={18} />
          Manje traženja, više pripadanja
        </span>
      </div>
      <section className="container featured-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">MOŽDA JE BAŠ OVO TVOJE MJESTO</span>
            <h2>
              Novi oglasi, novi počeci<span>.</span>
            </h2>
            <p>Upoznaj prostore i ljude koji čekaju baš tebe.</p>
          </div>
          <Link className="outline-link" to="/listings">
            Pogledaj sve oglase <ArrowUpRight size={18} />
          </Link>
        </div>
        <ListingsList
          items={data.filter((l) => l.kind === 'room').slice(0, 3)}
          loading={isPending}
          error={isError}
          retry={() => refetch()}
        />
      </section>
      <section className="how-section" id="kako-funkcionise">
        <div className="container">
          <div className="section-heading centered">
            <span className="eyebrow">OD PRETRAGE DO ZAJEDNIČKE KAFE</span>
            <h2>Tvoj novi dom, u tri koraka.</h2>
            <p>Bez komplikacija. Sa malo više dobre energije.</p>
          </div>
          <div className="steps">
            {[
              {
                icon: Search,
                title: 'Pronađi svoje mjesto',
                text: 'Izaberi grad, odredi budžet i otkrij sobe i cimere po svojoj mjeri.',
              },
              {
                icon: Users,
                title: 'Upoznaj svoje ljude',
                text: 'Pogledaj profile, navike i interesovanja. Dobar osjećaj je važan.',
              },
              {
                icon: Heart,
                title: 'Započni novu priču',
                text: 'Povežite se, dogovorite upoznavanje i napravite od stana dom.',
              },
            ].map((step, i) => (
              <div className="step" key={step.title}>
                <span className="step-number">0{i + 1}</span>
                <step.icon size={26} />
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container">
        <div className="cta">
          <div>
            <span className="eyebrow">IMAŠ SLOBODNU SOBU?</span>
            <h2>
              Možda baš ti imaš
              <br />
              nečiji novi dom.
            </h2>
            <p>Objavi oglas besplatno i pronađi svog sljedećeg cimera.</p>
            <Link className="btn btn-primary" to="/post">
              Objavi svoj oglas <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="cta-art" aria-hidden="true">
            <div className="house-roof" />
            <div className="house-body">
              <Heart size={48} />
              <span />
            </div>
            <span className="art-spark">✳</span>
          </div>
        </div>
      </section>
    </>
  )
}
