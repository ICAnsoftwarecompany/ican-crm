import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar } from '../../../shared/components/calendar'
import { ModuleNotice } from '../../../shared/components/module-pages'
import { Button } from '../../../shared/components/ui/Button'
import { ActivityFormDialog } from '../../activities'
import { ActivityPreviewDrawer, calendarSourceRegistry, useCalendarEvents } from '../../calendar'
import { getCommunicationModule } from '../constants/communicationModules'

const ACTIVITY_TYPE_BY_SOURCE = { calls: 'call', meetings: 'meeting' }

/**
 * A module-scoped view of the shared Calendar engine: same events and drawers as /calendar,
 * limited to the module's `calendarSourceIds`. Modules with no dated source yet (conversations,
 * team chat) show an empty calendar plus a notice instead of fake events.
 */
export function CommunicationCalendar({ moduleId }) {
  const { t } = useTranslation()
  const module = getCommunicationModule(moduleId)
  const sourceIds = module.calendarSourceIds
  const { events, isLoading, error, refetch } = useCalendarEvents()
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [createType, setCreateType] = useState(null)

  const sources = useMemo(
    () => calendarSourceRegistry.getAll().filter((source) => sourceIds.includes(source.id)),
    [sourceIds]
  )
  const visibleSourceIds = useMemo(() => new Set(sourceIds), [sourceIds])
  const moduleEvents = useMemo(() => events.filter((event) => visibleSourceIds.has(event.sourceId)), [events, visibleSourceIds])
  const activityType = ACTIVITY_TYPE_BY_SOURCE[sourceIds[0]] || null

  return (
    <div className="space-y-3">
      {!sourceIds.length && <ModuleNotice>{t(`communication.modules.${module.id}.calendarNotice`)}</ModuleNotice>}

      <Calendar
        events={moduleEvents}
        sources={sources}
        visibleSourceIds={visibleSourceIds}
        onEventClick={(event) => setSelectedActivity(event.raw)}
        onSlotClick={activityType ? () => setCreateType(activityType) : undefined}
        isLoading={sourceIds.length ? isLoading : false}
        error={sourceIds.length ? error : null}
        onRetry={refetch}
        className="h-[calc(100vh-var(--header-height)-8rem)]"
        createSlot={activityType && (
          <Button variant="accent" size="sm" className="w-full" onClick={() => setCreateType(activityType)}>
            {t(`activities.lockedHeader.${activityType}.create`)}
          </Button>
        )}
      />

      <ActivityPreviewDrawer
        activity={selectedActivity}
        open={Boolean(selectedActivity)}
        onClose={() => setSelectedActivity(null)}
        onSaved={refetch}
      />

      {activityType && (
        <ActivityFormDialog
          isOpen={Boolean(createType)}
          initialType={createType || activityType}
          onClose={() => setCreateType(null)}
          onSaved={() => {
            setCreateType(null)
            refetch()
          }}
        />
      )}
    </div>
  )
}
