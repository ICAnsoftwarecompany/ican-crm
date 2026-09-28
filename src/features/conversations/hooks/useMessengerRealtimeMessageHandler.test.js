// @vitest-environment jsdom
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  MESSENGER_CONVERSATIONS_QUERY_KEY,
  MESSENGER_CONVERSATION_INFO_QUERY_KEY,
  MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY,
} from '../utils/messengerConversations'
import { playMessengerNotificationSound } from '../utils/messengerNotificationSound'
import { useMessengerRealtimeMessageHandler } from './useMessengerRealtimeMessageHandler'

vi.mock('../utils/messengerNotificationSound', () => ({ playMessengerNotificationSound: vi.fn() }))

function renderHandler(queryClient, props) {
  const wrapper = ({ children }) => createElement(QueryClientProvider, { client: queryClient }, children)
  return renderHook(() => useMessengerRealtimeMessageHandler(props), { wrapper }).result.current
}

describe('useMessengerRealtimeMessageHandler', () => {
  let queryClient

  beforeEach(() => {
    queryClient = new QueryClient()
    vi.mocked(playMessengerNotificationSound).mockClear()
  })

  it('adds an incoming message to the conversation cache, highlights it and plays the sound', () => {
    const highlightMessage = vi.fn()
    queryClient.setQueryData(MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY(51), { data: [{ id: 'm_1', body: 'Hi' }] })
    const handle = renderHandler(queryClient, { selectedId: '51', highlightMessage })

    handle({ message: { id: 'm_2', body: 'Price?', direction: 'inbound' }, conversation_id: 51 }, '.messenger.message.received')

    expect(queryClient.getQueryData(MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY(51))).toEqual({
      data: [{ id: 'm_1', body: 'Hi' }, { id: 'm_2', body: 'Price?', direction: 'inbound' }],
    })
    expect(highlightMessage).toHaveBeenCalledWith('m_2')
    expect(playMessengerNotificationSound).toHaveBeenCalledWith('m_2')
  })

  it('does not highlight when canHighlight is false (sidebar list view) or for another conversation', () => {
    const highlightMessage = vi.fn()
    const hidden = renderHandler(queryClient, { selectedId: '51', highlightMessage, canHighlight: false })
    hidden({ message: { id: 'm_3', body: 'x' }, conversation_id: 51 })

    const visible = renderHandler(queryClient, { selectedId: '51', highlightMessage })
    visible({ message: { id: 'm_4', body: 'y' }, conversation_id: 52 })

    expect(highlightMessage).not.toHaveBeenCalled()
    expect(queryClient.getQueryData(MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY(52))).toEqual([{ id: 'm_4', body: 'y' }])
  })

  it('does not play the sound for outgoing messages', () => {
    const handle = renderHandler(queryClient, { selectedId: '51', highlightMessage: vi.fn() })
    handle({ message: { id: 'm_5', body: 'Sent', direction: 'outbound' }, conversation_id: 51 })
    expect(playMessengerNotificationSound).not.toHaveBeenCalled()
  })

  it('upserts conversation patches into the list and info caches', () => {
    queryClient.setQueryData(MESSENGER_CONVERSATIONS_QUERY_KEY, [{ id: 51, unread_count: 0, last_message_at: '2026-09-20T10:00:00Z' }])
    queryClient.setQueryData(MESSENGER_CONVERSATION_INFO_QUERY_KEY(51), { success: true, data: { id: 51, status: 'open' } })
    const handle = renderHandler(queryClient, { selectedId: '51', highlightMessage: vi.fn() })

    handle({ conversation: { id: 51, unread_count: 2, status: 'closed' } }, '.messenger.conversation.updated')

    expect(queryClient.getQueryData(MESSENGER_CONVERSATIONS_QUERY_KEY)).toEqual([
      { id: 51, unread_count: 2, status: 'closed', last_message_at: '2026-09-20T10:00:00Z' },
    ])
    expect(queryClient.getQueryData(MESSENGER_CONVERSATION_INFO_QUERY_KEY(51))).toEqual({
      success: true,
      data: { id: 51, status: 'closed', unread_count: 2 },
    })
  })

  it('applies status patches and invalidates list/info when there is no new message', () => {
    queryClient.setQueryData(MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY(51), [{ id: 'm_1', status: 'sent' }])
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const handle = renderHandler(queryClient, { selectedId: '51', highlightMessage: vi.fn() })

    handle({ message_id: 'm_1', status: 'read' }, '.messenger.message.read')

    expect(queryClient.getQueryData(MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY(51))[0]).toMatchObject({ id: 'm_1', status: 'read' })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: MESSENGER_CONVERSATIONS_QUERY_KEY })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: MESSENGER_CONVERSATION_INFO_QUERY_KEY('51') })
    expect(playMessengerNotificationSound).not.toHaveBeenCalled()
  })
})
