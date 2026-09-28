import { describe, expect, it, vi } from 'vitest'
import { gmailApi } from '../../api/gmailApi'
import {
  GMAIL_BUSINESS_EMAILS_QUERY_KEY,
  GMAIL_CONVERSATIONS_QUERY_KEY,
  GMAIL_CONVERSATION_INFO_QUERY_KEY,
  GMAIL_CONVERSATION_MESSAGES_QUERY_KEY,
  GMAIL_CUSTOMER_CONVERSATION_QUERY_KEY,
  GMAIL_LEAD_CONVERSATION_QUERY_KEY,
  GMAIL_MAILBOXES_QUERY_KEY,
  filterGmailConversations,
  getGmailConversationSubtitle,
  getGmailConversationTitle,
  normalizeGmailMessage,
} from '../../utils/gmailConversations'
import { gmailFixtures as fixtures } from '../__fixtures__/conversationFixtures'
import { gmailAdapter as adapter } from './adapter'

// gmailApi imports httpClient, which throws at import time without a tenant.
vi.mock('../../../../services/httpClient', () => ({ default: {} }))

function withoutAdapterFields({ channel, conversationId, source, subject, ...legacy }) {
  return legacy
}

describe('gmailAdapter.normalizeMessage', () => {
  it.each(Object.entries(fixtures.messages))('matches normalizeGmailMessage for %s', (_, message) => {
    const result = adapter.normalizeMessage(message, fixtures.conversationInfo)
    expect(withoutAdapterFields(result)).toEqual(normalizeGmailMessage(message, fixtures.conversationInfo))
    expect(result.channel).toBe('gmail')
    expect(result.source).toBe(message)
  })

  it('adds the subject and keeps the legacy enriched raw (D1)', () => {
    const result = adapter.normalizeMessage(fixtures.messages.sentWithAttachment, fixtures.conversationInfo)
    expect(result).toMatchObject({ direction: 'outgoing', status: 'sent', subject: 'Quote', conversationId: '7' })
    expect(result.raw).toMatchObject({ contact_email: 'sales@company.com', body: 'Please find the quote attached.' })
    expect(result.attachments[0]).toMatchObject({ type: 'file', label: 'quote.pdf', mimeType: 'application/pdf' })
  })

  it('marks read received mail as read', () => {
    expect(adapter.normalizeMessage(fixtures.messages.receivedRead).status).toBe('read')
  })
})

describe('gmailAdapter.getMessageId', () => {
  it.each(Object.entries(fixtures.messages))('returns the id normalizeGmailMessage computes for %s', (_, message) => {
    expect(adapter.getMessageId(message)).toBe(normalizeGmailMessage(message).id)
  })

  it('builds a fallback id when the message has none', () => {
    expect(adapter.getMessageId(fixtures.messages.withoutIds)).toBe('2026-09-22T06:00:00Z-No ids here')
  })
})

describe('gmailAdapter.normalizeMessages', () => {
  it('normalizes and sorts oldest first', () => {
    const result = adapter.normalizeMessages(Object.values(fixtures.messages), fixtures.conversationInfo)
    expect(result.map((message) => message.text)).toEqual(['No ids here', 'Looks good', 'Please find the quote attached.'])
  })
})

describe('gmailAdapter.normalizeConversation', () => {
  it('builds the normalized model from a full conversation', () => {
    const raw = fixtures.conversations.full
    const conversation = adapter.normalizeConversation(raw)

    expect(conversation).toMatchObject({
      channel: 'gmail',
      id: '7',
      title: 'Quote request',
      subtitle: 'Thanks, attached.',
      unreadCount: 1,
      updatedAt: '2026-09-22T09:00:00Z',
      status: 'closed',
      linkedCustomerId: '3',
      linkedLeadId: '',
      assignedUser: { id: '4', name: '' },
      contact: { id: '3', name: 'Client Buyer', email: 'client@buyer.com', phone: '+2010000000' },
    })
    expect(conversation.raw).toBe(raw)
    expect(conversation.lastMessage).toMatchObject({ subject: 'Re: Quote request', direction: 'incoming' })
  })

  it.each(Object.entries(fixtures.conversations))('delegates title/subtitle to the legacy getters for %s', (_, raw) => {
    const conversation = adapter.normalizeConversation(raw)
    expect(conversation.title).toBe(getGmailConversationTitle(raw))
    expect(conversation.subtitle).toBe(getGmailConversationSubtitle(raw))
  })

  it('derives the participant email from the last message when none is explicit', () => {
    const conversation = adapter.normalizeConversation(fixtures.conversations.noParticipant)
    expect(conversation.contact).toMatchObject({ id: '44', name: 'Lead Buyer', email: 'buyer@other.com' })
    expect(conversation.linkedLeadId).toBe('44')
  })
})

describe('gmailAdapter wiring', () => {
  it('keeps the existing query keys', () => {
    const keys = adapter.queryKeys.workspace
    expect(keys.all()).toEqual(['gmail'])
    expect(keys.conversations({ per_page: 30 })).toEqual(GMAIL_CONVERSATIONS_QUERY_KEY({ per_page: 30 }))
    expect(keys.conversationInfo(7)).toEqual(GMAIL_CONVERSATION_INFO_QUERY_KEY(7))
    expect(keys.conversationMessages(7, { page: 2 })).toEqual(GMAIL_CONVERSATION_MESSAGES_QUERY_KEY(7, { page: 2 }))
    expect(keys.customerConversation(3)).toEqual(GMAIL_CUSTOMER_CONVERSATION_QUERY_KEY(3))
    expect(keys.leadConversation(44)).toEqual(GMAIL_LEAD_CONVERSATION_QUERY_KEY(44))
    expect(keys.mailboxes()).toEqual(GMAIL_MAILBOXES_QUERY_KEY())
    expect(keys.businessEmails()).toEqual(GMAIL_BUSINESS_EMAILS_QUERY_KEY())
    expect(adapter.queryKeys.floating).toEqual({})
  })

  it('exposes the existing API and filter unchanged', () => {
    expect(adapter.api).toBe(gmailApi)
    expect(adapter.filterConversations).toBe(filterGmailConversations)
  })
})

describe('gmailAdapter.normalizeRealtimeEvent', () => {
  it('resolves the message and conversation id like useGmailRealtime', () => {
    const message = { id: 'g9', snippet: 'New mail' }
    expect(adapter.normalizeRealtimeEvent({ message, conversation: { id: 7 } }, '.gmail.message.received')).toEqual({
      channel: 'gmail',
      eventName: '.gmail.message.received',
      conversationId: 7,
      message,
      conversation: { id: 7 },
    })
  })

  it('falls back to the payload itself and the subscribed conversation id', () => {
    const payload = { id: 'g10', snippet: 'Flat payload' }
    const event = adapter.normalizeRealtimeEvent(payload, '.gmail.message.received', { fallbackConversationId: 7 })
    expect(event.message).toBe(payload)
    expect(event.conversationId).toBe(7)
  })
})
