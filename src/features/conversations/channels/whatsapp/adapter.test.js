import { describe, expect, it, vi } from 'vitest'
import { WHATSAPP_INTEGRATION_QUERY_KEYS, whatsappIntegrationApi } from '../../../integrations/whatsapp'
import {
  WHATSAPP_CONVERSATIONS_QUERY_KEY,
  WHATSAPP_CONVERSATION_INFO_QUERY_KEY,
  WHATSAPP_CONVERSATION_MESSAGES_QUERY_KEY,
  filterWhatsappConversations,
  getWhatsappConversationSubtitle,
  getWhatsappConversationTitle,
  normalizeWhatsappMessage,
} from '../../utils/whatsappConversations'
import { whatsappFixtures as fixtures } from '../__fixtures__/conversationFixtures'
import { whatsappAdapter as adapter } from './adapter'

// The adapter exposes whatsappIntegrationApi, which imports httpClient; it throws
// at import time without a tenant subdomain / VITE_API_PASSWORD.
vi.mock('../../../../services/httpClient', () => ({ default: {} }))

function withoutAdapterFields({ channel, conversationId, source, ...legacy }) {
  return legacy
}

describe('whatsappAdapter.normalizeMessage', () => {
  it.each(Object.entries(fixtures.messages))('matches normalizeWhatsappMessage for %s', (_, message) => {
    const result = adapter.normalizeMessage(message, fixtures.conversationInfo)
    expect(withoutAdapterFields(result)).toEqual(normalizeWhatsappMessage(message, fixtures.conversationInfo))
    expect(result.channel).toBe('whatsapp')
    expect(result.source).toBe(message)
  })

  it('keeps the legacy enriched raw (D1): raw.id is the WhatsApp message id', () => {
    const result = adapter.normalizeMessage(fixtures.messages.outgoingByFromId, fixtures.conversationInfo)
    expect(result.direction).toBe('outgoing')
    expect(result.raw.id).toBe('wamid.1')
    expect(result.raw.database_id).toBe(1)
    expect(result.source.id).toBe(1)
  })

  it('resolves conversationId from the argument, the message, then the conversation info', () => {
    expect(adapter.normalizeMessage({ id: 1 }, {}, 77).conversationId).toBe('77')
    expect(adapter.normalizeMessage({ id: 1, conversation_id: 5 }).conversationId).toBe('5')
    expect(adapter.normalizeMessage({ id: 1 }, fixtures.conversationInfo).conversationId).toBe('41')
  })

  it('normalizes attachments from both attachments and files', () => {
    const media = adapter.normalizeMessage(fixtures.messages.incomingWithMedia)
    expect(media.attachments[0]).toMatchObject({ type: 'image', url: 'https://cdn.example.com/a.jpg', label: 'a.jpg' })
    const file = adapter.normalizeMessage(fixtures.messages.fileWithoutId)
    expect(file.attachments[0]).toMatchObject({ type: 'file', mimeType: 'application/pdf' })
  })
})

describe('whatsappAdapter.normalizeMessages', () => {
  it('normalizes and sorts oldest first', () => {
    const result = adapter.normalizeMessages(Object.values(fixtures.messages), fixtures.conversationInfo, 41)
    expect(result.map((message) => message.text)).toEqual([
      'Contract attached',
      'Here is the photo',
      'Hi Mona, yes it is.',
    ])
    expect(result.every((message) => message.conversationId === '41')).toBe(true)
  })
})

describe('whatsappAdapter.normalizeConversation', () => {
  it('builds the normalized model from a full conversation', () => {
    const raw = fixtures.conversations.full
    const conversation = adapter.normalizeConversation(raw)

    expect(conversation).toMatchObject({
      channel: 'whatsapp',
      id: '41',
      title: 'Mona Ali',
      subtitle: 'Hello, is the offer still valid?',
      unreadCount: 3,
      updatedAt: '2026-09-20T10:00:00Z',
      status: 'open',
      linkedCustomerId: '12',
      linkedLeadId: '99',
      assignedUser: { id: '5', name: 'Sara' },
      contact: {
        id: '7',
        name: 'Mona Ali',
        phone: '+201001234567',
        email: 'mona@example.com',
        avatarUrl: 'https://cdn.example.com/mona.jpg',
      },
    })
    expect(conversation.raw).toBe(raw)
    expect(conversation.contact.raw).toBe(raw.contact)
    expect(conversation.lastMessage).toMatchObject({ direction: 'incoming', conversationId: '41' })
  })

  it.each(Object.entries(fixtures.conversations))('delegates title/subtitle to the legacy getters for %s', (_, raw) => {
    const conversation = adapter.normalizeConversation(raw)
    expect(conversation.title).toBe(getWhatsappConversationTitle(raw))
    expect(conversation.subtitle).toBe(getWhatsappConversationSubtitle(raw))
  })

  it('handles sparse conversations', () => {
    const firstLast = adapter.normalizeConversation(fixtures.conversations.firstLastName)
    expect(firstLast).toMatchObject({ id: '42', title: 'Omar Hassan', status: 'closed', linkedCustomerId: '30', assignedUser: null })

    const empty = adapter.normalizeConversation(fixtures.conversations.empty)
    expect(empty).toMatchObject({ id: '', unreadCount: 0, status: 'open', lastMessage: null, linkedCustomerId: '', linkedLeadId: '' })
  })
})

describe('whatsappAdapter wiring', () => {
  it('keeps the existing workspace query keys', () => {
    const keys = adapter.queryKeys.workspace
    expect(keys.all()).toEqual(['integrations', 'whatsapp'])
    expect(keys.all()).toBe(WHATSAPP_INTEGRATION_QUERY_KEYS.all)
    expect(keys.conversations({ per_page: 30 })).toEqual(WHATSAPP_CONVERSATIONS_QUERY_KEY({ per_page: 30 }))
    expect(keys.conversationInfo(41)).toEqual(WHATSAPP_CONVERSATION_INFO_QUERY_KEY(41))
    expect(keys.conversationMessages(41)).toEqual(WHATSAPP_CONVERSATION_MESSAGES_QUERY_KEY(41))
  })

  it('reproduces the floating chat query keys built inline in useWhatsappFloatingChat', () => {
    const keys = adapter.queryKeys.floating
    expect(keys.conversationLookup('lead', 99)).toEqual(['whatsapp-chat', 'lead', 99, 'conversation'])
    expect(keys.conversationInfo(41)).toEqual(['whatsapp-chat', 'conversation-info', 41])
    expect(keys.conversationMessages(41)).toEqual(['whatsapp-chat', 'conversation-messages', 41])
  })

  it('exposes the live WhatsApp API and legacy filter unchanged', () => {
    expect(adapter.api).toBe(whatsappIntegrationApi)
    expect(adapter.filterConversations).toBe(filterWhatsappConversations)
  })

  it('extracts lists and entities from nested responses', () => {
    expect(adapter.extractConversations({ data: { data: [{ id: 1 }] } })).toEqual([{ id: 1 }])
    expect(adapter.extractMessages({ messages: [{ id: 2 }] })).toEqual([{ id: 2 }])
    expect(adapter.extractEntity({ data: { data: { id: 3 } } })).toEqual({ id: 3 })
  })
})

describe('whatsappAdapter.normalizeRealtimeEvent', () => {
  it('resolves message, conversation and id from nested data', () => {
    const message = { id: 3, body: 'New message', direction: 'inbound' }
    const event = adapter.normalizeRealtimeEvent(
      { data: { whatsapp_message: message, whatsapp_conversation_id: 41, conversation: { id: 41 } } },
      '.whatsapp.message.received',
    )
    expect(event).toEqual({
      channel: 'whatsapp',
      eventName: '.whatsapp.message.received',
      conversationId: 41,
      message,
      conversation: { id: 41 },
      isNewIncomingMessage: true,
    })
  })

  it('falls back to the subscribed conversation id and ignores status/outgoing events', () => {
    const status = adapter.normalizeRealtimeEvent({ message: { id: 4, status: 'read' } }, '.whatsapp.message.read', { fallbackConversationId: 41 })
    expect(status.conversationId).toBe(41)
    expect(status.isNewIncomingMessage).toBe(false)

    const outgoing = adapter.normalizeRealtimeEvent({ message: { id: 5, direction: 'outbound' } }, '.whatsapp.message.sent')
    expect(outgoing.isNewIncomingMessage).toBe(false)

    expect(adapter.normalizeRealtimeEvent({}, '.whatsapp.conversation.updated')).toMatchObject({ message: null, conversationId: '' })
  })
})
