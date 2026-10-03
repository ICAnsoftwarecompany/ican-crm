import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar } from '../../../../shared/components/calendar'
import { ActivityPreviewDrawer, calendarSourceRegistry } from '../../../calendar'
import { TaskDrawer } from '../../../tasks'
import { getDealPagePath } from '../../constants/dealWorkspacePages'
import { useDealCalendarEvents } from '../../hooks/useDealCalendarEvents'
import { useDealWorkspace } from '../../hooks/useDealWorkspace'
import { DEAL_CALENDAR_SOURCES } from '../../utils/dealCalendar'

const SOURCES = [...calendarSourceRegistry.getAll(), ...DEAL_CALENDAR_SOURCES]

/**
 * The shared Calendar limited to this deal: its tasks, calls and meetings, contract installments and the
 * deal's start / end. Click a task → task drawer, an activity → activity drawer, an installment → its contract.
 */
export function DealCalendar() {
  const navigate = useNavigate()
  const { dealId } = useDealWorkspace()
  const { events, isLoading, error, refetch } = useDealCalendarEvents()
  const [visible, setVisible] = useState(() => new Set(SOURCES.map((source) => source.id)))
  const [activity, setActivity] = useState(null)
  const [taskId, setTaskId] = useState(null)

  const toggleSource = (id) => setVisible((current) => {
    const next = new Set(current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  const onEventClick = (event) => {
    if (event.sourceId === 'tasks') setTaskId(event.rawId)
    else if (event.sourceId === 'calls' || event.sourceId === 'meetings') setActivity(event.raw)
    else if (event.raw?.kind === 'installment') navigate(`${getDealPagePath(dealId, 'contracts')}?contract=${event.raw.contract.id}`)
  }

  const visibleIds = useMemo(() => new Set(visible), [visible])

  return (
    <>
      <Calendar
        events={events}
        sources={SOURCES}
        visibleSourceIds={visibleIds}
        onToggleSource={toggleSource}
        onEventClick={onEventClick}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        className="h-[calc(100vh-var(--header-height)-16rem)]"
      />
      <ActivityPreviewDrawer activity={activity} open={Boolean(activity)} onClose={() => setActivity(null)} onSaved={refetch} />
      <TaskDrawer open={Boolean(taskId)} taskId={taskId} onClose={() => setTaskId(null)} onUpdated={refetch} onDeleted={() => { setTaskId(null); refetch() }} />
    </>
  )
}
