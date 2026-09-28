// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { formatConversationTime } from '../../utils/formatConversationTime'
import { InitialsAvatar } from './InitialsAvatar'
import { LastMessageStatus } from './LastMessageStatus'

afterEach(cleanup)

describe('formatConversationTime', () => {
  it('returns an empty string for missing or invalid dates', () => {
    expect(formatConversationTime('')).toBe('')
    expect(formatConversationTime(null)).toBe('')
    expect(formatConversationTime('not a date')).toBe('')
  })

  it('formats valid dates with the existing ar-EG options', () => {
    const value = '2026-09-28T10:05:00Z'
    expect(formatConversationTime(value)).toBe(new Date(value).toLocaleString('ar-EG', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }))
  })
})

describe('InitialsAvatar', () => {
  const tone = { activeClassName: 'tone-active', idleClassName: 'tone-idle' }

  it('renders up to two initials and the idle tone', () => {
    const { container } = render(<InitialsAvatar title="mona ali hassan" fallbackInitial="W" {...tone} />)
    expect(container.firstChild.textContent).toBe('MA')
    expect(container.firstChild.className).toContain('tone-idle')
    expect(container.firstChild.className).not.toContain('tone-active')
  })

  it('uses the channel fallback letter, the active tone and caps the unread badge', () => {
    const { container } = render(<InitialsAvatar title="  " unreadCount={120} active fallbackInitial="G" {...tone} />)
    expect(container.firstChild.className).toContain('tone-active')
    expect(container.firstChild.textContent).toBe('G99+')
  })

  it('hides the badge when there is nothing unread', () => {
    const { container } = render(<InitialsAvatar title="Omar" fallbackInitial="W" {...tone} />)
    expect(container.querySelectorAll('span span')).toHaveLength(0)
  })
})

describe('LastMessageStatus', () => {
  const conversation = (direction, status) => ({ last_message: { direction, status } })

  it.each([
    ['outbound', 'read', 'seen'],
    ['outgoing', 'seen', 'seen'],
    ['outbound', 'delivered', 'delivered'],
  ])('shows ticks for %s / %s', (direction, status, label) => {
    const { container } = render(<LastMessageStatus conversation={conversation(direction, status)} />)
    expect(container.querySelector('svg').getAttribute('aria-label')).toBe(label)
  })

  it.each([
    ['inbound', 'read'],
    ['sent', 'read'],
    ['outbound', 'sent'],
  ])('renders nothing for %s / %s', (direction, status) => {
    const { container } = render(<LastMessageStatus conversation={conversation(direction, status)} />)
    expect(container.firstChild).toBeNull()
  })
})
