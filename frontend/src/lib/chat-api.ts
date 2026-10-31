import { apiRequest } from './api-client'
export type Conversation = {
  id: number
  listingId: number | null
  listingTitle: string
  person: { id: number; displayName: string; avatarUrl: string | null }
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}
export type ChatMessage = { id: number; senderId: number; body: string; createdAt: string }
export type History = { items: ChatMessage[]; hasMore: boolean }
export type ChatPage = { items: Conversation[]; total: number; pages: number }
export const chatApi = {
  list: (page = 1) => apiRequest<ChatPage>('/conversations?page=' + page + '&size=30'),
  get: (id: number) => apiRequest<Conversation>('/conversations/' + id),
  unread: () => apiRequest<{ count: number }>('/conversations/unread-count'),
  start: (listingId: number, body: string, clientId: string) =>
    apiRequest<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ listingId, body, clientId }),
    }),
  history: (id: number, beforeId?: number) =>
    apiRequest<History>(
      '/conversations/' + id + '/messages?size=50' + (beforeId ? '&beforeId=' + beforeId : ''),
    ),
  send: (id: number, body: string, clientId: string) =>
    apiRequest<ChatMessage>('/conversations/' + id + '/messages', {
      method: 'POST',
      body: JSON.stringify({ body, clientId }),
    }),
  read: (id: number, throughId: number) =>
    apiRequest<void>('/conversations/' + id + '/read', {
      method: 'POST',
      body: JSON.stringify({ throughId }),
    }),
}
