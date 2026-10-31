import { Link, useLocation, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, MapPin, MessageCircle, UserRound } from 'lucide-react'
import { usersApi } from '../api/users-api'
import { ApiError, apiMessage } from '@/lib/api-client'
import { defaultAvatar } from '@/lib/profile-store'

export function PublicProfile() {
  const { id } = useParams()
  const location = useLocation()
  const userId = Number(id)
  const conversationId = location.state?.conversationId
  const listingId = location.state?.listingId
  const fromListing = Number.isInteger(listingId) && listingId > 0
  const fromConversation = !fromListing && Number.isInteger(conversationId) && conversationId > 0
  const back = fromListing
    ? '/listings/' + listingId
    : fromConversation
      ? '/messages/' + conversationId
      : '/listings'
  const backLabel = fromListing
    ? 'Nazad na oglas'
    : fromConversation
      ? 'Nazad na razgovor'
      : 'Nazad na oglase'
  const profile = useQuery({
    queryKey: ['users', 'public', userId],
    queryFn: () => usersApi.getPublic(userId),
    retry: false,
  })
  if (profile.isPending)
    return (
      <div className="container page-content" role="status">
        Učitavam profil...
      </div>
    )
  if (profile.isError || !profile.data)
    return (
      <div className="container page-content empty-state">
        <h1>
          {profile.error instanceof ApiError && profile.error.status === 404
            ? 'Profil nije pronađen.'
            : 'Profil trenutno nije dostupan.'}
        </h1>
        <p>{apiMessage(profile.error)}</p>
        <button className="btn btn-outline" onClick={() => profile.refetch()}>
          Pokušaj ponovo
        </button>
        <Link className="btn btn-primary" to={back}>
          {backLabel}
        </Link>
      </div>
    )
  const person = profile.data
  return (
    <div className="container page-content public-profile-page">
      <Link className="back-link" to={back}>
        <ArrowLeft size={16} />
        {backLabel}
      </Link>
      <article className="public-profile-card">
        <div className="public-profile-cover">
          <span className="eyebrow">UPOZNAJ SAGOVORNIKA</span>
        </div>
        <div className="public-profile-identity">
          <img src={person.avatarUrl || defaultAvatar} alt={'Profilna fotografija: ' + person.displayName} />
          <div>
            <span className="eyebrow">JAVNI PROFIL</span>
            <h1>
              {person.displayName}
              {person.age !== null && <span>, {person.age}</span>}
            </h1>
            {person.occupation && <p>{person.occupation}</p>}
            {person.city && (
              <span className="public-profile-city">
                <MapPin size={14} />
                {person.city}
              </span>
            )}
          </div>
        </div>
        <section className="public-profile-bio">
          <h2>
            <UserRound size={19} />
            Nešto o meni
          </h2>
          <p>{person.bio || 'Korisnik još nije dodao biografiju. Upoznajte se kroz razgovor.'}</p>
        </section>
        {(fromListing || fromConversation) && (
          <div className="public-profile-footer">
            <p>Najbolje upoznavanje počinje dobrim razgovorom.</p>
            <Link className="btn btn-primary" to={back}>
              {fromListing ? <ArrowLeft size={17} /> : <MessageCircle size={17} />}
              {fromListing ? 'Nazad na oglas' : 'Nastavi razgovor'}
            </Link>
          </div>
        )}
      </article>
    </div>
  )
}
