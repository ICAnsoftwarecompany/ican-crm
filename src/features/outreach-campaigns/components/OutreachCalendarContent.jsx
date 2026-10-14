import { Calendar } from '../../../shared/components/calendar'

const SOURCES = [{ id: 'outreach-campaigns', labelKey: 'outreachCampaigns.navigation.all', colorVar: '--brand-accent' }]

export function OutreachCalendarContent({ events, query, onOpenCampaign }) {
  return (
    <Calendar
      events={events}
      sources={SOURCES}
      onEventClick={(event) => onOpenCampaign(event.rawId)}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={query.refetch}
      className="h-[calc(100vh-12rem)]"
    />
  )
}
