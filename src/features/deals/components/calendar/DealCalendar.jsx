import { getDealPagePath } from '../../constants/dealWorkspacePages'
import { useDealCalendarEvents } from '../../hooks/useDealCalendarEvents'
import { useDealWorkspace } from '../../hooks/useDealWorkspace'
import { DealCalendarView } from './DealCalendarView'

/** Calendar of one deal: its tasks, calls and meetings, contract installments and the deal's start / end. */
export function DealCalendar() {
  const { dealId } = useDealWorkspace()
  const { events, isLoading, error, refetch } = useDealCalendarEvents()
  return (
    <DealCalendarView
      events={events}
      isLoading={isLoading}
      error={error}
      refetch={refetch}
      contractPath={(contract) => `${getDealPagePath(dealId, 'contracts')}?contract=${contract.id}`}
    />
  )
}
