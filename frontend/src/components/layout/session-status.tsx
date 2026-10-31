import { apiMessage } from '@/lib/api-client'
export function SessionStatus({ error, retry }: { error?: unknown; retry?: () => void }) {
  return (
    <div className="container page-content">
      <div className="empty-state" aria-busy={!error}>
        <h2>{error ? 'Profil trenutno nije dostupan.' : 'Učitavam tvoj profil...'}</h2>
        {Boolean(error) && (
          <>
            <p role="alert">{apiMessage(error)}</p>
            <button className="btn btn-primary" onClick={retry}>
              Pokušaj ponovo
            </button>
          </>
        )}
      </div>
    </div>
  )
}
