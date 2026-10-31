import { useId, useRef, useState } from 'react'
import { ArrowRight, Check, CircleCheck, Pause, Settings2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiMessage } from '@/lib/api-client'
import { useUpdateListing } from '../api/use-listings'
import type { Listing, ListingStatus } from '../types'

export const listingStatusLabels: Record<ListingStatus, string> = {
  active: 'Aktivan',
  paused: 'Pauziran',
  matched: 'Pronađen cimer',
}
const statusOptions = {
  active: {
    icon: CircleCheck,
    hint: 'Otvoren za nove cimere',
    consequence:
      'Oglas će biti vidljiv u javnoj pretrazi i među omiljenim oglasima. Posjetioci će ponovo moći da koriste dugme „Javi se“.',
  },
  paused: {
    icon: Pause,
    hint: 'Privremena pauza u potrazi',
    consequence:
      'Oglas će biti sakriven iz javne pretrage i liste omiljenih, a dugme „Javi se“ neće biti dostupno. Direktan link će prikazivati da je oglas pauziran.',
  },
  matched: {
    icon: Check,
    hint: 'Uspješno završena potraga',
    consequence:
      'Oglas će biti označen kao „Pronađen cimer“ i sakriven iz javne pretrage i liste omiljenih. Dugme „Javi se“ neće biti dostupno, a direktan link će prikazivati da je potraga završena.',
  },
}

export function ListingStatusControl({ listing }: { listing: Listing }) {
  const update = useUpdateListing()
  const current = listing.status || 'active'
  const [next, setNext] = useState<ListingStatus>(current)
  const dialog = useRef<HTMLDialogElement>(null)
  const saving = useRef(false)
  const id = useId()
  const close = () => {
    if (!saving.current) dialog.current?.close()
  }
  return (
    <>
      <div className="listing-status-control">
        <div className="listing-status-summary">
          <span>Status oglasa</span>
          <strong className={'status-value status-' + current}>
            <i aria-hidden="true" />
            {listingStatusLabels[current]}
          </strong>
        </div>
        <button
          type="button"
          className="listing-status-trigger"
          aria-label={'Promijeni status oglasa: ' + listing.title}
          aria-haspopup="dialog"
          onClick={() => {
            setNext(current)
            update.reset()
            dialog.current?.showModal()
          }}
        >
          <Settings2 size={15} />
          Promijeni
        </button>
      </div>
      {update.isSuccess && (
        <p className="listing-status-saved" role="status">
          Status je sačuvan.
        </p>
      )}
      <dialog
        ref={dialog}
        className="contact-dialog status-dialog"
        aria-modal="true"
        aria-labelledby={id + '-title'}
        aria-describedby={id + '-description'}
        onCancel={(event) => {
          if (saving.current) event.preventDefault()
        }}
        onClick={(event) => {
          event.stopPropagation()
          if (event.target === event.currentTarget) event.preventDefault()
        }}
      >
        <button
          type="button"
          className="dialog-close"
          aria-label="Zatvori"
          disabled={update.isPending}
          onClick={close}
        >
          <X size={20} />
        </button>
        <span className="advice-icon">
          <Settings2 size={25} />
        </span>
        <h2 id={id + '-title'}>Promijeni status oglasa</h2>
        <p className="status-dialog-listing">{listing.title}</p>
        <fieldset className="status-options" disabled={update.isPending}>
          <legend className="sr-only">Izaberi novi status</legend>
          {(Object.entries(statusOptions) as [ListingStatus, typeof statusOptions.active][])
            .filter(([value]) => value !== 'paused')
            .map(([value, option]) => {
              const Icon = option.icon
              return (
                <label key={value} className={'status-option ' + (next === value ? 'selected' : '')}>
                  <input
                    type="radio"
                    name={id + '-status'}
                    value={value}
                    checked={next === value}
                    onChange={() => {
                      setNext(value)
                      update.reset()
                    }}
                  />
                  <Icon size={19} aria-hidden="true" />
                  <span>
                    <strong>
                      {listingStatusLabels[value]}
                      {value === current && <small>Trenutni status</small>}
                    </strong>
                    <span>{option.hint}</span>
                  </span>
                </label>
              )
            })}
        </fieldset>
        <div className="status-change-explanation" id={id + '-description'} aria-live="polite">
          <strong>Šta ova promjena znači?</strong>
          <p>{statusOptions[next].consequence}</p>
          <p>
            Opis i fotografije se ne brišu. Oglas ostaje sačuvan korisnicima koji su ga dodali u omiljene i
            ponovo će se prikazati kada bude aktivan. Oglas i dalje vidiš u „Moji oglasi“, gdje u svakom
            trenutku možeš ponovo promijeniti status.
          </p>
        </div>
        {update.isError && (
          <p className="field-error" role="alert">
            {apiMessage(update.error)}
          </p>
        )}
        <div className="delete-dialog-actions">
          <Button
            type="button"
            className="btn btn-outline"
            variant="outline"
            autoFocus
            disabled={update.isPending}
            onClick={close}
          >
            Odustani
          </Button>
          <Button
            type="button"
            className="btn btn-primary"
            disabled={update.isPending || next === current}
            onClick={async () => {
              if (saving.current || next === current) return
              saving.current = true
              try {
                await update.mutateAsync({ id: listing.id, changes: { status: next } })
                dialog.current?.close()
              } catch {
                /* Keep the chosen status and show the error for retry. */
              } finally {
                saving.current = false
              }
            }}
          >
            {update.isPending ? 'Čuvam...' : 'Potvrdi promjenu'}
            <ArrowRight size={16} />
          </Button>
        </div>
      </dialog>
    </>
  )
}
