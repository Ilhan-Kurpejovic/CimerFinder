import { useQuery } from '@tanstack/react-query'
import { NavLink } from 'react-router'
import { MessageSquareText } from 'lucide-react'
import { useCurrentUser } from '@/lib/use-current-user'
import { chatApi } from '@/lib/chat-api'
export function MessagesNav() {
  const user = useCurrentUser()
  const { data } = useQuery({
    queryKey: ['chat', user?.id, 'unread'],
    queryFn: chatApi.unread,
    enabled: !!user,
    refetchInterval: 5000,
    retry: false,
  })
  if (!user) return null
  return (
    <NavLink
      className={({ isActive }) =>
        'messages-nav' + (data?.count ? ' has-unread' : '') + (isActive ? ' active' : '')
      }
      title="Poruke"
      to="/messages"
      aria-label={'Poruke' + (data?.count ? ', nepročitane: ' + data.count : '')}
    >
      <MessageSquareText size={21} strokeWidth={1.8} aria-hidden="true" />
      {!!data?.count && <span aria-hidden="true">{data.count > 99 ? '99+' : data.count}</span>}
    </NavLink>
  )
}
