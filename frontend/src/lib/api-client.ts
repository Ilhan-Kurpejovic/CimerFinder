import { getAccessToken, setAccessToken } from './auth-session'
const messages: Record<string, string> = {
  conversation_not_found: 'Razgovor nije pronađen.',
  not_conversation_participant: 'Ovom razgovoru mogu pristupiti samo njegovi učesnici.',
  cannot_message_self: 'Ne možeš poslati poruku na svoj oglas.',
  listing_unavailable: 'Oglas više nije aktivan. Novi razgovor nije moguće započeti.',
  message_conflict: 'Poruka je promijenjena. Pokušaj ponovo.',
  invalid_read_position: 'Poruke trenutno nije moguće označiti kao pročitane.',
  invalid_credentials: 'Email ili lozinka nijesu ispravni.',
  email_already_registered: 'Već postoji nalog sa ovom email adresom.',
  not_authenticated: 'Prijavi se da nastaviš.',
  invalid_token: 'Prijava je istekla. Prijavi se ponovo.',
  not_listing_owner: 'Možeš mijenjati samo svoje oglase.',
  listing_not_found: 'Oglas nije pronađen. Možda je obrisan.',
  profile_incomplete: 'Prije objavljivanja dopuni ime, godine i zanimanje na profilu.',
  server_error: 'Server trenutno nije dostupan. Pokušaj ponovo.',
  image_too_large: 'Fotografija je prevelika. Najveća dozvoljena veličina je 5 MB.',
  unsupported_image: 'Podržane su samo JPG, PNG i WebP fotografije.',
  invalid_image: 'Fotografija nije ispravna, ima prevelike dimenzije ili je animirana. Izaberi drugu.',
  not_media_owner: 'Ovu fotografiju može koristiti samo njen vlasnik.',
  media_not_found: 'Fotografija više nije dostupna. Dodaj je ponovo.',
  media_in_use: 'Fotografija je još povezana sa profilom ili oglasom.',
  invalid_media_purpose: 'Izaberi fotografiju dodatu za ovu namjenu.',
  image_storage_error: 'Fotografija trenutno ne može da se sačuva. Pokušaj ponovo.',
  validation_error: 'Provjeri unesene podatke i pokušaj ponovo.',
}
export class ApiError extends Error {
  status: number
  code: string
  fieldErrors: Record<string, string>
  constructor(status: number, code: string, fieldErrors: Record<string, string> = {}) {
    super(messages[code] || 'Zahtjev nije uspio. Pokušaj ponovo.')
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  const headers = new Headers(options.headers)
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', 'Bearer ' + token)
  let response: Response
  try {
    response = await fetch('/api' + path, { ...options, headers })
  } catch {
    throw new Error('Veza sa serverom nije dostupna. Provjeri da li je backend pokrenut i pokušaj ponovo.')
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    if (
      response.status === 401 &&
      token &&
      getAccessToken() === token &&
      path !== '/auth/login' &&
      path !== '/auth/register'
    )
      setAccessToken(null)
    throw new ApiError(response.status, data.code || 'server_error', data.fieldErrors)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
export function apiMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Zahtjev nije uspio. Pokušaj ponovo.'
}
export function isHttpUrl(value: string) {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}
