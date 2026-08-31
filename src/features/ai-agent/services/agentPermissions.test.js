import { describe, expect, it } from 'vitest'
import {
  canAutoRunAiAction,
  isAiActionBlocked,
  requiresAiApproval,
} from './agentPermissions'

describe('agentPermissions', () => {
  it('auto approves low-risk actions', () => {
    expect(canAutoRunAiAction('lead.note')).toBe(true)
  })

  it('requires approval for sensitive actions', () => {
    expect(requiresAiApproval('message.send')).toBe(true)
  })

  it('blocks forbidden actions', () => {
    expect(isAiActionBlocked('customer.delete')).toBe(true)
  })
})
