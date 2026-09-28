import { describe, expect, it, vi } from 'vitest'
import { messengerApi } from '../../api/messengerApi'
import { filterMessengerConversations } from '../../components/MessengerConversationFilters'
import {
  MESSENGER_CONVERSATIONS_QUERY_KEY,
  MESSENGER_CONVERSATION_INFO_QUERY_KEY,
  MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY,
  getMessengerConversationSubtitle,
  getMessengerConversationTitle,
  normalizeMessengerMessage,
} from '../../utils/messengerConversations'
import { messengerFixtures as fixtures } from '../__fixtures__/conversationFixtures'
import { messengerAdapter as adapter } from './adapter'

// messengerApi imports httpClient, which throws at import time without a tenant.
vi.mock('../../../../services/httpClient', () => ({ default: {} }))

function withoutAdapterFields({ channel, conversationId, source, ...legacy }) {
  return legacy
}

describe('messengerAdapter.normalizeMessage', () => {
  it.each(Object.entries(fixtures.messages))('matches normalizeMessengerMessage for %s', (_, message) => {
    const result = adapter.normalizeMessage(message, fixtures.conversationInfo)
    expect(withoutAdapterFields(result)).toEqual(normalizeMessengerMessage(message, fixtures.conversationInfo))
    expect(result.channel).toBe('messenger')
    expect(result.source).toBe(message)
  })

  it('derives direction from page id and passes unknown directions through (D2)', () => {
    expect(adapter.normalizeMessage(fixtures.messages.outgoingByPageId, fixtures.conversationInfo).direction).toBe('outgoing')
    expect(adapter.normalizeMessage(fixtures.messages.incomingByDirection, fixtures.conversationInfo).direction).toBe('incoming')
    expect(adapter.normalizeMessage(fixtures.messages.passThroughDirection, fixtures.conversationInfo).direction).toBe('sent')
  })

  it('keeps raw as the untouched message for Messenger', () => {
    const message = fixtures.messages.incomingByDirection
    const result = adapter.normalizeMessage(message, fixtures.conversationInfo)
    expect(result.raw).toBe(message)
    expect(result).toMatchObject({ id: 'm_2', text: 'I need help', replyToMessageId: 'm_1', conversationId: '51' })
  })
})

describe('messengerAdapter.normalizeMessages', () => {
  it('normalizes and sorts oldest first', () => {
    const result = adapter.normalizeMessages(Object.values(fixtures.messages), fixtures.conversationInfo)
    expect(result.map((message) => message.id)).toEqual(['m_3', 'm_2', 'm_1'])
  })
})

describe('messengerAdapter.normalizeConversation', () => {
  it('builds the normalized model from a full conversation', () => {
    const raw = fixtures.conversations.full
    const conversation = adapter.normalizeConversation(raw)

    expect(conversation).toMatchObject({
      channel: 'messenger',
      id: '51',
      title: 'Youssef',
      subtitle: 'Price please',
      unreadCount: 2,
      updatedAt: '2026-09-21T12:00:00Z',
      status: 'open',
      linkedCustomerId: '14',
      linkedLeadId: '70',
      assignedUser: { id: '6', name: 'Karim' },
      contact: {
        id: '8',
        name: 'Youssef',
        email: 'youssef@example.com',
        avatarUrl: 'https://cdn.example.com/y.jpg',
      },
    })
    expect(conversation.raw).toBe(raw)
    expect(conversation.lastMessage).toMatchObject({ id: 'm_5', direction: 'incoming', conversationId: '51' })
  })

  it.each(Object.entries(fixtures.conversations))('delegates title/subtitle to the legacy getters for %s', (_, raw) => {
    const conversation = adapter.normalizeConversation(raw)
    expect(conversation.title).toBe(getMessengerConversationTitle(raw))
    expect(conversation.subtitle).toBe(getMessengerConversationSubtitle(raw))
  })

  it('handles sparse conversations', () => {
    expect(adapter.normalizeConversation(fixtures.conversations.usernameOnly)).toMatchObject({
      id: '52',
      title: 'yara.shop',
      subtitle: 'Direct text',
      assignedUser: { id: '9', name: 'Nour' },
      lastMessage: null,
    })
    expect(adapter.normalizeConversation(fixtures.conversations.audioLastMessage).status).toBe('closed')
  })
})

describe('messengerAdapter wiring', () => {
  it('keeps the existing workspace query keys', () => {
    const keys = adapter.queryKeys.workspace
    expect(keys.conversations()).toBe(MESSENGER_CONVERSATIONS_QUERY_KEY)
    expect(keys.conversationInfo(51)).toEqual(MESSENGER_CONVERSATION_INFO_QUERY_KEY(51))
    expect(keys.conversationMessages(51)).toEqual(MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY(51))
  })

  it('reproduces the floating chat query keys built in useMessengerFloatingChat', () => {
    const keys = adapter.queryKeys.floating
    expect(keys.leadConversation(70)).toEqual(['messenger-chat', 'lead-conversation', 70])
    expect(keys.conversationInfo(51)).toEqual(['messenger-chat', 'conversation-info', 51])
    expect(keys.conversationMessages(51)).toEqual(['messenger-chat', 'conversation-messages', 51])
  })

  it('exposes the existing API and filter unchanged', () => {
    expect(adapter.api).toBe(messengerApi)
    expect(adapter.filterConversations).toBe(filterMessengerConversations)
  })

  it('extracts conversations, messages and entities', () => {
    expect(adapter.extractConversations({ data: { conversations: [{ id: 1 }] } })).toEqual([{ id: 1 }])
    expect(adapter.extractMessages({ data: { data: { data: [{ id: 2 }] } } })).toEqual([{ id: 2 }])
    expect(adapter.extractEntity({ data: { data: { id: 3 } } })).toEqual({ id: 3 })
    expect(adapter.extractEntity({ data: { id: 4 } })).toEqual({ id: 4 })
  })
})

describe('messengerAdapter.normalizeRealtimeEvent', () => {
  it('resolves a new message event', () => {
    const message = { id: 'm_9', body: 'hi' }
    expect(adapter.normalizeRealtimeEvent({ data: { message, conversation_id: 51 } }, '.messenger.message.received')).toEqual({
      channel: 'messenger',
      eventName: '.messenger.message.received',
      conversationId: 51,
      message,
      conversation: null,
      reaction: null,
      reactionMessageId: 'm_9',
      isReactionRemoval: false,
      messagePatch: message,
    })
  })

  it('resolves reaction removal and status patches', () => {
    const reaction = { emoji: '👍', message_id: 'm_1' }
    const removal = adapter.normalizeRealtimeEvent({ reaction, conversation_id: 51 }, '.messenger.message.reaction.deleted')
    expect(removal).toMatchObject({ reaction, reactionMessageId: 'm_1', isReactionRemoval: true, messagePatch: null })

    const status = adapter.normalizeRealtimeEvent({ message_id: 'm_1', status: 'read', read_at: '2026-09-21T12:05:00Z' }, '.messenger.message.read', {
      fallbackConversationId: 51,
    })
    expect(status.conversationId).toBe(51)
    expect(status.messagePatch).toMatchObject({ id: 'm_1', message_id: 'm_1', status: 'read', read_at: '2026-09-21T12:05:00Z' })
  })
})
