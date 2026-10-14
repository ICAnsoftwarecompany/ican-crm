import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar } from '../../../shared/components/calendar'
import { Button } from '../../../shared/components/ui/Button'
import { activitiesToCalendarEvents } from '../adapters/activityEventAdapter'
import { calendarSourceRegistry } from '../constants/calendarSources'
import { useVisibleSources } from '../hooks/useVisibleSources'

const ACTIVITY_SOURCE_IDS = ['calls', 'meetings']

/**
 * The shared Calendar engine showing an already-loaded (and already-filtered) list of calls and
 * meetings (added 2026-10-01). Used as the main view of /LeadsCenter/activities through
 * ActivitiesPage's `renderCalendar`, so the page's type/status/assignee filters apply here too.
 */
export function ActivitiesCalendarView({ activities = [], onActivityClick, onCreate, className }) {
  const { t } = useTranslation()
  const [visibleSourceIds, toggleSource] = useVisibleSources(ACTIVITY_SOURCE_IDS)
  const sources = useMemo(
    () => calendarSourceRegistry.getAll().filter((source) => ACTIVITY_SOURCE_IDS.includes(source.id)),
    []
  )
  const events = useMemo(() => activitiesToCalendarEvents(activities), [activities])

  return (
    <Calendar
      events={events}
      sources={sources}
      visibleSourceIds={visibleSourceIds}
      onToggleSource={toggleSource}
      onEventClick={(event) => onActivityClick?.(event.raw)}
      className={className || 'h-[calc(100vh-var(--header-height)-10rem)]'}
      createSlot={onCreate && (
        <div className="grid gap-2">
          <Button variant="accent" size="sm" className="w-full" onClick={() => onCreate('call')}>
            {t('activities.lockedHeader.call.create')}
          </Button>
          <Button variant="outline" size="sm" className="w-full" onClick={() => onCreate('meeting')}>
            {t('activities.lockedHeader.meeting.create')}
          </Button>
        </div>
      )}
    />
  )
}
