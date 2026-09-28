import { describe, expect, it, vi } from 'vitest'
import { gmailAdapter } from '../../channels/gmail/adapter'
import { messengerAdapter } from '../../channels/messenger/adapter'
import { whatsappAdapter } from '../../channels/whatsapp/adapter'
import { getThreadCapabilityProps } from './threadCapabilities'

// Adapters expose the channel APIs, which import httpClient (throws without a tenant).
vi.mock('../../../../services/httpClient', () => ({ default: {} }))

describe('getThreadCapabilityProps', () => {
  // The literals each ConversationThread consumer passed before Phase 4c.
  it.each([
    ['whatsapp', whatsappAdapter, { supportsAttachments: true, supportsReply: true, supportsReactions: true }],
    ['messenger', messengerAdapter, { supportsAttachments: true, supportsReply: true, supportsReactions: true }],
    ['gmail', gmailAdapter, { supportsAttachments: true, supportsReply: false, supportsReactions: false }],
  ])('%s keeps the thread props it used before', (_, adapter, expected) => {
    expect(getThreadCapabilityProps(adapter.capabilities)).toEqual(expected)
  })

  it('disables everything when no capabilities are given', () => {
    expect(getThreadCapabilityProps()).toEqual({ supportsAttachments: false, supportsReply: false, supportsReactions: false })
  })
})
