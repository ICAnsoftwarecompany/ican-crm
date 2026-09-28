import { describe, expect, it, vi } from 'vitest'
import { gmailAdapter } from './gmail/adapter'
import { messengerAdapter } from './messenger/adapter'
import { CONVERSATION_CHANNELS, getChannelAdapter, hasChannelAdapter } from './registry'
import { whatsappAdapter } from './whatsapp/adapter'

// Adapters expose the channel APIs, which import httpClient (throws without a tenant).
vi.mock('../../../services/httpClient', () => ({ default: {} }))

const ADAPTER_INTERFACE = [
  'api',
  'capabilities',
  'channel',
  'extractConversations',
  'extractEntity',
  'extractMessages',
  'filterConversations',
  'getConversationId',
  'getMessageId',
  'normalizeConversation',
  'normalizeMessage',
  'normalizeMessages',
  'normalizeRealtimeEvent',
  'queryKeys',
]

const CAPABILITY_KEYS = [
  'assign',
  'attachments',
  'closeReopen',
  'emailSubject',
  'linkCustomer',
  'mailboxes',
  'messagingWindowHours',
  'reactions',
  'removeReactions',
  'replies',
  'templates',
]

describe('conversation channel registry', () => {
  it('returns the adapter for each channel', () => {
    expect(CONVERSATION_CHANNELS).toEqual(['whatsapp', 'messenger', 'gmail'])
    expect(getChannelAdapter('whatsapp')).toBe(whatsappAdapter)
    expect(getChannelAdapter('messenger')).toBe(messengerAdapter)
    expect(getChannelAdapter('gmail')).toBe(gmailAdapter)
  })

  it('rejects unknown channels', () => {
    expect(hasChannelAdapter('sms')).toBe(false)
    expect(hasChannelAdapter('toString')).toBe(false)
    expect(() => getChannelAdapter('sms')).toThrow('Unknown conversation channel: sms')
  })

  it.each(CONVERSATION_CHANNELS)('%s adapter implements the shared interface', (channel) => {
    const adapter = getChannelAdapter(channel)
    expect(Object.keys(adapter).sort()).toEqual(ADAPTER_INTERFACE)
    expect(Object.keys(adapter.capabilities).sort()).toEqual(CAPABILITY_KEYS)
    expect(adapter.channel).toBe(channel)
    expect(Object.keys(adapter.queryKeys).sort()).toEqual(['floating', 'workspace'])
  })
})
