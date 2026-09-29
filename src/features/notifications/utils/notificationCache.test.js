import { describe, expect, it } from 'vitest'
import { markNotificationsRead, mergeNotifications, upsertNotification } from './notificationCache'

const first = { id: '1', createdAt: '2026-09-28T12:00:00Z', isRead: false }
const second = { id: '2', createdAt: '2026-09-29T12:00:00Z', isRead: false }

describe('notification cache helpers', () => {
  it('upserts without duplicates and keeps newest first', () => {
    expect(upsertNotification([first, second], { ...first, message: 'updated' })).toEqual([
      second,
      { ...first, message: 'updated' },
    ])
  })

  it('merges API and realtime collections without duplicates', () => {
    expect(mergeNotifications([first], [second, { ...first, message: 'realtime' }])).toEqual([
      second,
      { ...first, message: 'realtime' },
    ])
  })

  it('marks only requested notifications as read', () => {
    const result = markNotificationsRead([first, second], ['1'])
    expect(result[0].isRead).toBe(true)
    expect(result[1].isRead).toBe(false)
  })
})
