import { describe, expect, it } from 'vitest'
import { activitiesToCalendarEvents, activityToCalendarEvent } from './activityEventAdapter'

describe('activityToCalendarEvent', () => {
  it('maps a meeting to a "meetings" sourced event', () => {
    const event = activityToCalendarEvent({ id: 10, type: 'meeting', title: 'Kickoff', startAt: '2026-09-18 10:00:00', endAt: '2026-09-18 11:00:00' })

    expect(event.id).toBe('meeting-10')
    expect(event.sourceId).toBe('meetings')
    expect(event.allDay).toBe(false)
    expect(event.end.getHours()).toBe(11)
  })

  it('maps a call to a "calls" sourced event', () => {
    const event = activityToCalendarEvent({ id: 11, type: 'call', title: 'Follow-up call', startAt: '2026-09-18 10:00:00' })
    expect(event.sourceId).toBe('calls')
  })

  it('falls back end to start when end is missing or invalid', () => {
    const event = activityToCalendarEvent({ id: 12, type: 'call', title: 'No end', startAt: '2026-09-18 10:00:00', endAt: 'not-a-date' })
    expect(event.end.getTime()).toBe(event.start.getTime())
  })

  it('returns null when startAt is missing or unparsable', () => {
    expect(activityToCalendarEvent({ id: 13, type: 'call', title: 'No start' })).toBeNull()
    expect(activityToCalendarEvent({ id: 14, type: 'call', title: 'Bad start', startAt: 'not-a-date' })).toBeNull()
  })

  it('returns null without an id', () => {
    expect(activityToCalendarEvent({ type: 'call', title: 'No id', startAt: '2026-09-18 10:00:00' })).toBeNull()
  })
})

describe('activitiesToCalendarEvents', () => {
  it('drops unplottable activities and keeps the rest', () => {
    const events = activitiesToCalendarEvents([
      { id: 1, type: 'meeting', title: 'A', startAt: '2026-09-18 10:00:00' },
      { id: 2, type: 'call', title: 'B' },
    ])
    expect(events).toHaveLength(1)
  })
})
