import { createEventSourceRegistry } from '../../../shared/components/calendar'

/**
 * The only calendar sources wired up today. Opportunities/Outreach
 * Campaigns are explicitly deferred (mocked or dateless backend — see
 * docs/PHASE_3_HARDENING_REPORT.md's readiness reasoning); adding a real
 * source later is just another `register()` call here, nothing in
 * shared/components/calendar changes.
 */
export const calendarSourceRegistry = createEventSourceRegistry([
  { id: 'tasks', labelKey: 'calendar.sources.tasks', colorVar: '--calendar-tasks' },
  { id: 'meetings', labelKey: 'calendar.sources.meetings', colorVar: '--calendar-meetings' },
  { id: 'calls', labelKey: 'calendar.sources.calls', colorVar: '--calendar-calls' },
])

export const CALENDAR_SOURCE_IDS = calendarSourceRegistry.getAll().map((source) => source.id)
