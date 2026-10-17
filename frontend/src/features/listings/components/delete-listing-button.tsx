import { useRef } from 'react'
import { Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDeleteListing } from '../api/use-listings'
import type { Listing } from '../types'

export function DeleteListingButton({
  listing,
  onDeleted,
}: {
  listing: Listing
  onDeleted: (title: string) => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const remove = useDeleteListing()
  const close = () => {
    if (!remove.isPending) dialog.current?.close()
  }
  return (
    <>
      <button
        className="delete-listing-trigger"
        onClick={() => {
          remove.reset()
          dialog.current?.showModal()
        }}
        aria-label={`Obriši oglas: ${listing.title}`}
      >
        <Trash2 size={16} />
        Obriši oglas
      </button>
      <dialog
        ref={dialog}
        className="contact-dialog delete-dialog"
        aria-labelledby={`delete-title-${listing.id}`}
        aria-describedby={`delete-description-${listing.id}`}
        onCancel={(e) => {
          if (remove.isPending) e.preventDefault()
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close()
        }}
      >
        <button className="dialog-close" aria-label="Zatvori" disabled={remove.isPending} onClick={close}>
          <X size={20} />
        </button>
        <span className="delete-dialog-icon">
          <Trash2 size={25} />
        </span>
        <h2 id={`delete-title-${listing.id}`}>Obriši oglas?</h2>
        <p id={`delete-description-${listing.id}`}>
          Oglas „{listing.title}“ biće uklonjen iz pretrage i tvojih oglasa. Ovu radnju ne možeš poništiti.
        </p>
        {remove.isError && (
          <p className="field-error" role="alert">
            Brisanje nije uspelo. Proveri da li si prijavljen/a kao vlasnik oglasa i pokušaj ponovo.
          </p>
        )}
        <div className="delete-dialog-actions">
          <Button
            className="btn btn-outline"
            variant="outline"
            autoFocus
            disabled={remove.isPending}
            onClick={close}
          >
            Odustani
          </Button>
          <Button
            className="btn"
            variant="destructive"
            disabled={remove.isPending}
            onClick={async () => {
              try {
                await remove.mutateAsync(listing.id)
                dialog.current?.close()
                onDeleted(listing.title)
              } catch {
                /* Keep the dialog open and show the recoverable error. */
              }
            }}
          >
            <Trash2 size={16} />
            {remove.isPending ? 'Brišem...' : 'Obriši oglas'}
          </Button>
        </div>
      </dialog>
    </>
  )
}
