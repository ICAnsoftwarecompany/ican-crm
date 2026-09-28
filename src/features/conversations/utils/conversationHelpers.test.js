import { describe, expect, it } from 'vitest'
import { filterMessengerConversations } from '../components/MessengerConversationFilters'
import { filterGmailConversations, sortGmailMessagesAscending } from './gmailConversations'
import { getMessengerMessageId, sortMessagesAscending, upsertMessengerMessage } from './messengerConversations'
import {
  filterWhatsappConversations,
  getWhatsappConversationContact,
  getWhatsappConversationSubtitle,
  getWhatsappConversationTitle,
  getWhatsappMessageId,
  sortWhatsappMessagesAscending,
  upsertWhatsappMessage,
} from './whatsappConversations'
import { filterConversations, sortMessagesByTime, upsertMessageById } from './conversationHelpers'

// Normalized messages exercising every time fallback: createdAt, raw.sent_at,
// raw.received_at, raw.created_at, invalid and missing dates.
const MESSAGES = [
  { id: 'a', createdAt: '2026-09-20T10:00:00Z', raw: {} },
  { id: 'b', raw: { sent_at: '2026-09-20T08:00:00Z', received_at: '2026-09-20T11:00:00Z' } },
  { id: 'c', raw: { received_at: '2026-09-20T07:00:00Z', created_at: '2026-09-20T12:00:00Z' } },
  { id: 'd', raw: { created_at: '2026-09-20T09:00:00Z' } },
  { id: 'e', createdAt: 'not a date', raw: {} },
  { id: 'f', raw: null },
  { id: 'g', createdAt: '', raw: { sent_at: null, created_at: '2026-09-19T00:00:00Z' } },
]

const CONVERSATIONS = [
  {
    id: 1,
    contact: { name: 'Mona Ali', phone: '+201001234567', email: 'mona@example.com' },
    customer: { id: 12, name: 'Mona Co', email: 'sales@mona.co' },
    unread_count: 2,
    status: 'open',
    assigned_user: { id: 5, name: 'Sara' },
    subject: 'Offer',
    mailbox_email: 'sales@company.com',
    participant_email: 'mona@example.com',
    last_message: { body: 'Is the offer valid?', snippet: 'Is the offer valid?' },
  },
  {
    id: 2,
    contact: { first_name: 'Omar', last_name: 'Hassan', phone: '+201112223334' },
    unread_count: 0,
    status: 'CLOSED',
    assigned_user_id: 6,
    subject: 'Invoice',
    participant_name: 'Omar',
    last_message: { text: 'Thanks', snippet: 'Thanks' },
  },
  {
    id: 3,
    customer_id: 30,
    name: 'Walk-in',
    phone: '+201000000000',
    unread_count: '1',
    assigned_user: { name: 'Karim' },
    last_message: { type: 'image' },
  },
  { id: 4, status: ' closed ' },
]

const QUERIES = ['', '  MONA ', 'offer', 'thanks', '+2011', 'sara', 'sales@', 'no-match']
const FILTERS = [
  {},
  { unreadOnly: true },
  { unlinkedOnly: true },
  { closedOnly: true },
  { assignedUserId: 'all' },
  { assignedUserId: '5' },
  { assignedUserId: '6' },
  { assignedUserId: 'Karim' },
  { unreadOnly: true, unlinkedOnly: true, assignedUserId: 'Karim' },
]
const CASES = QUERIES.flatMap((query) => FILTERS.map((filters) => [query, filters]))

// WhatsApp trims the status before comparing; Gmail and Messenger do not.
function isClosedWithoutTrim(conversation) {
  return String(conversation.status || '').toLowerCase() === 'closed'
}

function ids(conversations) {
  return conversations.map((conversation) => conversation.id)
}

describe('sortMessagesByTime', () => {
  it('matches the WhatsApp and Messenger sorts (sent_at, created_at)', () => {
    expect(sortMessagesByTime(MESSAGES)).toEqual(sortWhatsappMessagesAscending(MESSAGES))
    expect(sortMessagesByTime(MESSAGES)).toEqual(sortMessagesAscending(MESSAGES))
  })

  it('matches the Gmail sort (received_at, created_at)', () => {
    expect(sortMessagesByTime(MESSAGES, ['received_at', 'created_at'])).toEqual(sortGmailMessagesAscending(MESSAGES))
  })

  it('does not mutate the input', () => {
    const input = [...MESSAGES]
    sortMessagesByTime(input)
    expect(input).toEqual(MESSAGES)
  })
})

describe('upsertMessageById', () => {
  const existing = [{ id: 'a', text: 'old', status: 'sent' }, { message_id: 'b', text: 'second' }]

  it.each([
    ['update by id', { id: 'a', status: 'read' }],
    ['update by message_id', { message_id: 'b', status: 'read' }],
    ['append new', { id: 'z', text: 'new' }],
    ['numeric vs string id', { id: 'a', text: 'patched' }],
  ])('matches the WhatsApp and Messenger upserts: %s', (_, message) => {
    expect(upsertMessageById(existing, message, getWhatsappMessageId)).toEqual(upsertWhatsappMessage(existing, message))
    expect(upsertMessageById(existing, message, getMessengerMessageId)).toEqual(upsertMessengerMessage(existing, message))
  })
})

describe('filterConversations', () => {
  it.each(CASES)('matches filterWhatsappConversations for query %j and filters %j', (query, filters) => {
    const result = filterConversations(CONVERSATIONS, query, filters, {
      matchesQuery: (conversation, normalizedQuery) => [
        getWhatsappConversationTitle(conversation),
        getWhatsappConversationContact(conversation),
        getWhatsappConversationSubtitle(conversation),
        conversation.assigned_user?.name,
      ].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery),
    })
    expect(ids(result)).toEqual(ids(filterWhatsappConversations(CONVERSATIONS, query, filters)))
  })

  it.each(CASES)('matches filterGmailConversations for query %j and filters %j', (query, filters) => {
    const result = filterConversations(CONVERSATIONS, query, filters, {
      isClosed: isClosedWithoutTrim,
      matchesQuery: (conversation, normalizedQuery) => [
        conversation.subject,
        conversation.mailbox_email,
        conversation.participant_email,
        conversation.participant_name,
        conversation.customer?.name,
        conversation.customer?.email,
        conversation.assigned_user?.name,
        conversation.last_message?.snippet,
      ].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery),
    })
    expect(ids(result)).toEqual(ids(filterGmailConversations(CONVERSATIONS, query, filters)))
  })

  it.each(CASES)('matches filterMessengerConversations for query %j and filters %j', (query, filters) => {
    const result = filterConversations(CONVERSATIONS, query, filters, {
      isClosed: isClosedWithoutTrim,
      getAssignedUser: (conversation) => ({
        id: String(conversation.assigned_user?.id || conversation.assignedUser?.id || conversation.assigned_user_id || ''),
        name: conversation.assigned_user?.name || conversation.assignedUser?.name || conversation.assigned_user_name || '',
      }),
      matchesQuery: (conversation, normalizedQuery) => {
        const title = String(
          conversation.contact?.name || conversation.customer?.name || conversation.name ||
          conversation.contact?.phone || conversation.customer?.phone || ''
        ).trim().toLowerCase()
        const subtitle = String(
          conversation.last_message?.body || conversation.last_message?.text || conversation.contact?.email ||
          conversation.customer?.email || conversation.assigned_user?.name || ''
        ).trim().toLowerCase()
        return title.includes(normalizedQuery) || subtitle.includes(normalizedQuery)
      },
    })
    expect(ids(result)).toEqual(ids(filterMessengerConversations(CONVERSATIONS, query, filters)))
  })

  it('treats a missing filters object as no filters', () => {
    expect(ids(filterConversations(CONVERSATIONS, '', undefined, { matchesQuery: () => true }))).toEqual([1, 2, 3, 4])
  })
})
