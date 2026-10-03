import { useDealsHubCalendarEvents } from '../../hooks/useDealsHubCalendarEvents'
import { DealCalendarView } from './DealCalendarView'

/** Calendar of every deal (hub `/deals/calendar`). A deal's start/end opens its workspace. */
export function DealsHubCalendar() {
  const { events, isLoading, error, refetch } = useDealsHubCalendarEvents()
  return (
    <DealCalendarView
      events={events}
      isLoading={isLoading}
      error={error}
      refetch={refetch}
      contractPath={(contract) => `/deals/contracts?contract=${contract.id}`}
      dealPath={(deal) => `/deals/${deal.id}`}
    />
  )
}
