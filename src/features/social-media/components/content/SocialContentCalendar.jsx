import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, createEventSourceRegistry } from '../../../../shared/components/calendar'
import { truncateCaption } from '../../utils/socialFormatters'

/**
 * Reuses the shared Calendar engine exactly as `pages/calendar/CalendarPage.jsx`
 * does — no new calendar engine (see docs "Calendar View"). Only shows
 * published content today (the only thing the Facebook API returns);
 * `contentToCalendarEvent` already reads `status`/`scheduledAt` from the
 * normalized model, so Draft/Scheduled events need no shape change once a
 * scheduling API exists — see docs "Planner Future Readiness".
 */
const socialEventSourceRegistry = createEventSourceRegistry([
  { id: 'social-content', labelKey: 'socialMedia.calendar.source', colorVar: '--calendar-social' },
])
const SOCIAL_EVENT_SOURCES = socialEventSourceRegistry.getAll()

function contentToCalendarEvent(content, untitledLabel) {
  const dateSource = content.publishedAt || content.scheduledAt
  if (!dateSource) return null
  const date = new Date(dateSource)
  if (Number.isNaN(date.getTime())) return null

  return {
    id: `social-${content.id}`,
    sourceId: 'social-content',
    title: truncateCaption(content.message, 60) || untitledLabel,
    start: date,
    end: date,
    allDay: false,
    status: content.status,
    rawId: content.id,
    raw: content,
  }
}

export function SocialContentCalendar({ items, isLoading, error, onRetry, onOpen }) {
  const { t } = useTranslation()
  const untitledLabel = t('socialMedia.content.untitled')

  const events = useMemo(
    () => items.map((content) => contentToCalendarEvent(content, untitledLabel)).filter(Boolean),
    [items, untitledLabel]
  )

  return (
    <Calendar
      events={events}
      sources={SOCIAL_EVENT_SOURCES}
      onEventClick={(event) => onOpen?.(event.raw)}
      canDragEvent={() => false}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      className="min-h-[600px]"
    />
  )
}
