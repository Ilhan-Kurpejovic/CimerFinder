import { createMessageId } from '@/lib/message-id'
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowUpRight, MessageCircle, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { chatApi } from '@/lib/chat-api'
import { apiMessage } from '@/lib/api-client'
import { useCurrentUserState } from '@/lib/use-current-user'
export function ContactListing({
  id,
  ownerId,
  name,
  active,
}: {
  id: number
  ownerId?: string
  name: string
  active: boolean
}) {
  const { user, isPending } = useCurrentUserState()
  const navigate = useNavigate()
  const client = useQueryClient()
  const dialog = useRef<HTMLDialogElement>(null)
  const attempt = useRef<{ body: string; id: string } | null>(null)
  const [body, setBody] = useState('')
  const mutation = useMutation({
    mutationFn: ({ text, key }: { text: string; key: string }) => chatApi.start(id, text, key),
    onSuccess: (conversation) => {
      void client.invalidateQueries({ queryKey: ['chat'] })
      dialog.current?.close()
      navigate('/messages/' + conversation.id)
    },
  })
  const close = () => {
    if (!mutation.isPending) dialog.current?.close()
  }
  if (user?.id === ownerId)
    return (
      <Link className="btn btn-outline full-width" to={'/listings/' + id + '/edit'}>
        Uredi svoj oglas
        <ArrowUpRight size={17} />
      </Link>
    )
  return (
    <>
      <Button
        className="btn btn-primary full-width"
        disabled={!active || isPending}
        onClick={() => {
          if (!user) {
            navigate('/login?next=/listings/' + id)
            return
          }
          mutation.reset()
          attempt.current = null
          setBody(
            'Ćao ' + name.split(' ')[0] + ', sviđa mi se tvoj oglas! Želim da se upoznamo i saznam više.',
          )
          dialog.current?.showModal()
        }}
      >
        <MessageCircle size={18} />
        {active ? 'Javi se' : 'Oglas nije aktivan'}
        <ArrowUpRight size={18} />
      </Button>
      <dialog
        ref={dialog}
        className="contact-dialog chat-contact-dialog"
        aria-labelledby={'contact-title-' + id}
        onCancel={(event) => {
          if (mutation.isPending) event.preventDefault()
        }}
      >
        <button
          type="button"
          className="dialog-close"
          aria-label="Zatvori"
          disabled={mutation.isPending}
          onClick={close}
        >
          <X size={20} />
        </button>
        <span className="advice-icon">
          <MessageCircle size={24} />
        </span>
        <h2 id={'contact-title-' + id}>Javi se: {name}</h2>
        <p>Predstavi se i napiši šta te zanima. Poruka stiže direktno u razgovor sa autorom oglasa.</p>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            const text = body.trim()
            if (!text || mutation.isPending) return
            if (attempt.current?.body !== text) attempt.current = { body: text, id: createMessageId() }
            mutation.mutate({ text, key: attempt.current.id })
          }}
        >
          <label>
            Tvoja poruka
            <textarea
              autoFocus
              required
              maxLength={2000}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              disabled={mutation.isPending}
            />
          </label>
          {mutation.isError && (
            <p className="field-error" role="alert">
              {apiMessage(mutation.error)}
            </p>
          )}
          <div className="delete-dialog-actions">
            <Button
              type="button"
              className="btn btn-outline"
              variant="outline"
              disabled={mutation.isPending}
              onClick={close}
            >
              Odustani
            </Button>
            <Button className="btn btn-primary" type="submit" disabled={mutation.isPending || !body.trim()}>
              <Send size={16} />
              {mutation.isPending ? 'Šaljem...' : 'Pošalji poruku'}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  )
}
