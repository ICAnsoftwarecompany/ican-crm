import { describe, expect, it } from 'vitest'
import { availability, expireHolds, hasConflict, workingWindow, zonedParts, zonedToUtc } from './schedulingEngine'

const calendar = { id: 'cal', timezone: 'Africa/Cairo', working_hours: [{ day: 'monday', enabled: true, start: '09:00', end: '12:00' }, { day: 'friday', enabled: false, start: '09:00', end: '12:00' }], holidays: [{ date: '2026-10-12' }] }
const tech = { id: 'r1', name: 'Tech', capacity: 1, calendar_id: 'cal' }
const NOW = Date.parse('2026-10-01T00:00:00Z')

describe('scheduling engine', () => {
  it('converts wall time in the calendar zone to UTC and back', () => {
    expect(zonedToUtc('2026-10-05', '09:00', 'Africa/Cairo')).toBe('2026-10-05T06:00:00.000Z')
    expect(zonedToUtc('2026-12-07', '09:00', 'Africa/Cairo')).toBe('2026-12-07T07:00:00.000Z')
    expect(zonedParts('2026-10-05T06:30:00.000Z', 'Africa/Cairo')).toEqual({ date: '2026-10-05', minutes: 570 })
  })

  it('knows days off and holidays', () => {
    expect(workingWindow(calendar, '2026-10-05')).toMatchObject({ start: '09:00', end: '12:00' })
    expect(workingWindow(calendar, '2026-10-09')).toBeNull()
    expect(workingWindow(calendar, '2026-10-12')).toBeNull()
  })

  it('never double-books a resource over its capacity', () => {
    const reservations = [{ id: 'a', resource_id: 'r1', status: 'confirmed', starts_at: '2026-10-05T06:00:00Z', ends_at: '2026-10-05T07:00:00Z', quantity: 1 }]
    expect(hasConflict(reservations, tech, { starts_at: '2026-10-05T06:30:00Z', ends_at: '2026-10-05T07:30:00Z' })).toBe(true)
    expect(hasConflict(reservations, tech, { starts_at: '2026-10-05T07:00:00Z', ends_at: '2026-10-05T08:00:00Z' })).toBe(false)
    expect(hasConflict(reservations, { ...tech, capacity: 2 }, { starts_at: '2026-10-05T06:30:00Z', ends_at: '2026-10-05T07:30:00Z' })).toBe(false)
    expect(hasConflict([{ ...reservations[0], status: 'released' }], tech, { starts_at: '2026-10-05T06:30:00Z', ends_at: '2026-10-05T07:30:00Z' })).toBe(false)
  })

  it('lists free slots and expires holds', () => {
    const reservations = [{ id: 'h', resource_id: 'r1', status: 'hold', hold_expires_at: '2026-09-30T00:00:00Z', starts_at: '2026-10-05T06:00:00Z', ends_at: '2026-10-05T07:00:00Z' }]
    expect(availability({ resources: [tech], calendars: [calendar], reservations, date: '2026-10-05', duration: 60, now: NOW }).map((slot) => slot.starts_at)).toEqual(['2026-10-05T07:00:00.000Z', '2026-10-05T07:30:00.000Z', '2026-10-05T08:00:00.000Z'])
    expect(expireHolds(reservations, NOW)).toHaveLength(1)
    expect(availability({ resources: [tech], calendars: [calendar], reservations, date: '2026-10-05', duration: 60, now: NOW })).toHaveLength(5)
  })
})
