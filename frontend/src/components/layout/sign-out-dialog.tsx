import { useEffect, useId, useRef } from 'react'
import { LogOut, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/profile-store'

export function SignOutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const title = useId()
  const description = useId()
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal()
    else if (!open && dialog.current?.open) dialog.current.close()
  }, [open])
  const close = () => dialog.current?.close()
  return (
    <dialog
      ref={dialog}
      className="contact-dialog"
      aria-labelledby={title}
      aria-describedby={description}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) close()
      }}
    >
      <button type="button" className="dialog-close" aria-label="Zatvori" onClick={close}>
        <X size={20} />
      </button>
      <span className="advice-icon">
        <LogOut size={25} />
      </span>
      <h2 id={title}>Želiš li stvarno da se odjaviš?</h2>
      <p id={description}>
        Za pristup profilu, svojim oglasima i omiljenim oglasima moraćeš ponovo da se prijaviš.
      </p>
      <div className="delete-dialog-actions">
        <Button type="button" className="btn btn-outline" variant="outline" autoFocus onClick={close}>
          Odustani
        </Button>
        <Button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            close()
            signOut()
          }}
        >
          <LogOut size={16} />
          Odjavi se
        </Button>
      </div>
    </dialog>
  )
}
