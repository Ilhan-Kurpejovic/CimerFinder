import { createMessageId } from '@/lib/message-id'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowUpRight, MessageCircle, Send, House } from 'lucide-react'
import { AccountPage } from '@/components/layout/account-page'
import { apiMessage } from '@/lib/api-client'
import { chatApi } from '@/lib/chat-api'
import type { Conversation } from '@/lib/chat-api'
import { defaultAvatar } from '@/lib/profile-store'
import { useCurrentUser } from '@/lib/use-current-user'

const date = (value: string) =>
  new Intl.DateTimeFormat('sr-Latn-RS', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
export function ChatPage() {
  const user = useCurrentUser()
  const { id } = useParams()
  const selected = Number(id) || 0
  const conversations = useInfiniteQuery({
    queryKey: ['chat', user?.id, 'list'],
    queryFn: ({ pageParam }) => chatApi.list(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last, pages) => (pages.length < last.pages ? pages.length + 1 : undefined),
    enabled: !!user,
    refetchInterval: 5000,
    retry: false,
  })
  const current = useQuery({
    queryKey: ['chat', user?.id, 'conversation', selected],
    queryFn: () => chatApi.get(selected),
    enabled: !!user && !!selected,
    refetchInterval: 5000,
    retry: false,
  })
  const items = conversations.data?.pages.flatMap((page) => page.items) || []
  return (
    <AccountPage section="messages">
      <div className={'chat-workspace ' + (selected ? 'has-conversation' : '')}>
        <aside className="chat-inbox">
          <div className="chat-inbox-heading">
            <h2>Razgovori</h2>
            <span>{conversations.data?.pages[0]?.total || 0}</span>
          </div>
          {conversations.isPending && (
            <p className="chat-placeholder" role="status">
              Učitavam razgovore...
            </p>
          )}
          {conversations.isError && (
            <div className="chat-placeholder" role="alert">
              <p>{apiMessage(conversations.error)}</p>
              <button className="text-link" onClick={() => conversations.refetch()}>
                Pokušaj ponovo
              </button>
            </div>
          )}
          {!conversations.isPending && !conversations.isError && !items.length && (
            <div className="chat-placeholder">
              <MessageCircle size={26} />
              <h3>Tvoja prva poruka je početak.</h3>
              <p>Otvori oglas koji ti se sviđa i klikni „Javi se“.</p>
              <Link className="text-link" to="/listings">
                Pronađi dom →
              </Link>
            </div>
          )}
          <div className="chat-inbox-list">
            {items.map((item) => (
              <Link
                className={'chat-conversation ' + (item.id === selected ? 'active' : '')}
                key={item.id}
                to={'/messages/' + item.id}
                aria-current={item.id === selected ? 'page' : undefined}
              >
                <img src={item.person.avatarUrl || defaultAvatar} alt="" />
                <div>
                  <strong>{item.person.displayName}</strong>
                  <span>{item.listingTitle}</span>
                  <p>{item.lastMessage}</p>
                </div>
                <div className="chat-conversation-meta">
                  <time dateTime={item.lastMessageAt}>
                    {new Intl.DateTimeFormat('sr-Latn-RS', { day: 'numeric', month: 'short' }).format(
                      new Date(item.lastMessageAt),
                    )}
                  </time>
                  {item.unreadCount > 0 && (
                    <b aria-label={item.unreadCount + ' nepročitanih poruka'}>{item.unreadCount}</b>
                  )}
                </div>
              </Link>
            ))}
          </div>
          {conversations.hasNextPage && (
            <button
              className="chat-load-more"
              disabled={conversations.isFetchingNextPage}
              onClick={() => conversations.fetchNextPage()}
            >
              Još razgovora
            </button>
          )}
        </aside>
        <section className="chat-main" aria-label="Prepiska">
          {selected ? (
            current.isPending ? (
              <p className="chat-placeholder" role="status">
                Učitavam prepisku...
              </p>
            ) : current.isError || !current.data ? (
              <div className="chat-placeholder">
                <Link className="text-link" to="/messages">
                  ← Svi razgovori
                </Link>
                <p role="alert">{apiMessage(current.error)}</p>
                <button className="btn btn-outline" onClick={() => current.refetch()}>
                  Pokušaj ponovo
                </button>
              </div>
            ) : (
              <Thread key={selected + ':' + user?.id} conversation={current.data} />
            )
          ) : (
            <div className="chat-welcome">
              <span className="advice-icon">
                <MessageCircle size={30} />
              </span>
              <h2>
                Dobar razgovor.
                <br />
                Novi početak.
              </h2>
              <p>Izaberi razgovor sa lijeve strane ili se javi nekome čiji ti se oglas dopada.</p>
              <Link className="btn btn-outline" to="/listings">
                Pogledaj oglase
                <ArrowUpRight size={16} />
              </Link>
            </div>
          )}
        </section>
      </div>
    </AccountPage>
  )
}

function Thread({ conversation }: { conversation: Conversation }) {
  const user = useCurrentUser()
  const client = useQueryClient()
  const [body, setBody] = useState('')
  const [focused, setFocused] = useState(() => document.hasFocus() && document.visibilityState === 'visible')
  const attempt = useRef<{ body: string; id: string } | null>(null)
  const scroll = useRef<HTMLDivElement>(null)
  const pinned = useRef(true)
  const reading = useRef(0)
  const readThrough = useRef(0)
  const id = conversation.id
  const history = useInfiniteQuery({
    queryKey: ['chat', user?.id, 'history', id],
    queryFn: ({ pageParam }) => chatApi.history(id, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (last) => (last.hasMore ? last.items[0]?.id : undefined),
    refetchInterval: 3000,
    retry: false,
  })
  const messages = [...(history.data?.pages || [])].reverse().flatMap((page) => page.items)
  const latest = messages.at(-1)?.id || 0
  const mutation = useMutation({
    mutationFn: ({ text, key }: { text: string; key: string }) => chatApi.send(id, text, key),
    onSuccess: () => {
      setBody('')
      attempt.current = null
      pinned.current = true
      void client.invalidateQueries({ queryKey: ['chat'] })
    },
  })
  useEffect(() => {
    const update = () => setFocused(document.hasFocus() && document.visibilityState === 'visible')
    window.addEventListener('focus', update)
    window.addEventListener('blur', update)
    document.addEventListener('visibilitychange', update)
    return () => {
      window.removeEventListener('focus', update)
      window.removeEventListener('blur', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])
  useEffect(() => {
    if (pinned.current) scroll.current?.scrollTo({ top: scroll.current.scrollHeight })
  }, [latest])
  useEffect(() => {
    if (!focused || !latest || latest <= readThrough.current || reading.current) return
    reading.current = latest
    let mounted = true
    void chatApi
      .read(id, latest)
      .then(() => {
        readThrough.current = latest
        if (mounted) void client.invalidateQueries({ queryKey: ['chat'] })
      })
      .catch(() => {
        /* A later poll retries the read acknowledgment. */
      })
      .finally(() => {
        reading.current = 0
      })
    return () => {
      mounted = false
    }
  }, [focused, id, latest, history.dataUpdatedAt, client])
  const send = () => {
    const text = body.trim()
    if (!text || mutation.isPending || history.isError || history.isPending) return
    if (attempt.current?.body !== text) attempt.current = { body: text, id: createMessageId() }
    mutation.mutate({ text, key: attempt.current.id })
  }
  return (
    <>
      <header className="chat-thread-header">
        <Link className="chat-back" to="/messages" aria-label="Nazad na razgovore">
          <ArrowLeft size={20} />
        </Link>
        <Link
          className="chat-person-avatar"
          to={'/users/' + conversation.person.id}
          state={{ conversationId: conversation.id }}
          aria-label={'Otvori profil: ' + conversation.person.displayName}
        >
          <img src={conversation.person.avatarUrl || defaultAvatar} alt="" />
        </Link>
        <div>
          <h2>
            <Link to={'/users/' + conversation.person.id} state={{ conversationId: conversation.id }}>
              {conversation.person.displayName}
            </Link>
          </h2>
          <Link
            className="chat-person-profile-link"
            to={'/users/' + conversation.person.id}
            state={{ conversationId: conversation.id }}
          >
            Pogledaj profil
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </header>
      <div className="chat-listing-context">
        <span className="chat-listing-context-icon">
          <House size={23} />
        </span>
        <div>
          <span className="chat-listing-context-label">RAZGOVOR O OGLASU</span>
          <h3>{conversation.listingTitle}</h3>
          {!conversation.listingId && <small>Oglas je uklonjen. Razgovor ostaje sačuvan.</small>}
        </div>
        {conversation.listingId && (
          <Link
            to={'/listings/' + conversation.listingId}
            aria-label={'Pogledaj oglas: ' + conversation.listingTitle}
          >
            Pogledaj oglas
            <ArrowUpRight size={16} />
          </Link>
        )}
      </div>
      <div
        className="chat-messages"
        ref={scroll}
        onScroll={(event) => {
          const element = event.currentTarget
          pinned.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80
        }}
      >
        {history.hasNextPage && (
          <button
            className="chat-load-more"
            disabled={history.isFetchingNextPage}
            onClick={async () => {
              const element = scroll.current
              const height = element?.scrollHeight || 0
              const top = element?.scrollTop || 0
              pinned.current = false
              await history.fetchNextPage()
              requestAnimationFrame(() => {
                if (element) element.scrollTop = top + element.scrollHeight - height
              })
            }}
          >
            {history.isFetchingNextPage ? 'Učitavam...' : 'Ranije poruke'}
          </button>
        )}
        {history.isPending && <p role="status">Učitavam poruke...</p>}
        {history.isError && (
          <div role="alert">
            <p>{apiMessage(history.error)}</p>
            <button className="text-link" onClick={() => history.refetch()}>
              Pokušaj ponovo
            </button>
          </div>
        )}
        <div className="chat-message-list" aria-label="Poruke u razgovoru">
          {messages.map((message) => (
            <article
              key={message.id}
              className={'chat-bubble ' + (String(message.senderId) === user?.id ? 'mine' : 'theirs')}
            >
              <p>{message.body}</p>
              <time dateTime={message.createdAt}>{date(message.createdAt)}</time>
            </article>
          ))}
        </div>
      </div>
      <form
        className="chat-composer"
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
      >
        {mutation.isError && (
          <p className="field-error" role="alert">
            {apiMessage(mutation.error)} Poruka je ostala u polju — pokušaj ponovo.
          </p>
        )}
        <div>
          <label className="sr-only" htmlFor="chat-message">
            Tvoja poruka
          </label>
          <textarea
            id="chat-message"
            rows={2}
            maxLength={2000}
            placeholder="Napiši poruku..."
            value={body}
            disabled={mutation.isPending}
            onChange={(event) => setBody(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault()
                send()
              }
            }}
          />
          <button
            className="btn btn-primary"
            type="submit"
            disabled={!body.trim() || mutation.isPending || history.isError || history.isPending}
            aria-label="Pošalji poruku"
          >
            <Send size={18} />
            <span>{mutation.isPending ? 'Šaljem...' : 'Pošalji'}</span>
          </button>
        </div>
        <small>Enter za slanje · Shift + Enter za novi red · {body.length}/2000</small>
      </form>
    </>
  )
}
