import { describe, expect, it } from 'vitest'
import { campaignToCalendarEvent, campaignsToCalendarEvents } from './campaignCalendar'

describe('outreach campaign calendar adapter', () => {
  it('maps scheduled campaign dates to the shared calendar contract', () => {
    const event = campaignToCalendarEvent({ id: 3, name: 'Launch', startsAt: '2026-09-21 14:30:00', status: 'scheduled' })
    expect(event.sourceId).toBe('outreach-campaigns')
    expect(event.start.getHours()).toBe(14)
    expect(event.rawId).toBe(3)
  })

  it('omits campaigns without a valid date', () => {
    expect(campaignsToCalendarEvents([{ id: 1, startsAt: '' }, { id: 2, startsAt: 'invalid' }])).toEqual([])
  })
})
