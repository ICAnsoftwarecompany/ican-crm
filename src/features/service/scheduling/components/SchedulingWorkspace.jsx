import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { useResourceList } from '../../settings/api/settingsApi'
import { schedulingResourcesResource, RESOURCE_TYPES } from '../../settings/resources/schedulingResources'
import { useReservations } from '../api/schedulingApi'
import { DEFAULT_TIME_ZONE, shiftDate, todayInZone, useZonedFormat } from '../utils/zonedTime'
import { NewReservationDialog } from './NewReservationDialog'
import { ReservationDialog } from './ReservationDialog'
import { ResourceDayBoard } from './ResourceDayBoard'

/** Scheduling (spec §19): resources × day, holds and bookings; new reservation from free slots. */
export function SchedulingWorkspace({ workOrderPath, timeZone = DEFAULT_TIME_ZONE }) {
  const { t } = useTranslation()
  const format = useZonedFormat(timeZone)
  const [date, setDate] = useState(todayInZone(timeZone))
  const [type, setType] = useState('')
  const [selected, setSelected] = useState(null)
  const [creating, setCreating] = useState(false)
  const resources = useResourceList(schedulingResourcesResource)
  const reservations = useReservations({ date })
  const visible = useMemo(() => (resources.data || []).filter((resource) => resource.status !== 'inactive' && (!type || resource.type === type)), [resources.data, type])
  const types = useMemo(() => RESOURCE_TYPES.filter((value) => (resources.data || []).some((resource) => resource.type === value)), [resources.data])
  const holds = (reservations.data || []).filter((entry) => entry.status === 'hold')

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap items-end gap-2">
          <Button variant="outline" size="icon" aria-label={t('service.scheduling.previousDay')} onClick={() => setDate((current) => shiftDate(current, -1))}><ChevronLeft size={16} className="rtl:-scale-x-100" aria-hidden="true" /></Button>
          <Input type="date" dir="ltr" aria-label={t('service.scheduling.fields.date')} value={date} onChange={(event) => event.target.value && setDate(event.target.value)} />
          <Button variant="outline" size="icon" aria-label={t('service.scheduling.nextDay')} onClick={() => setDate((current) => shiftDate(current, 1))}><ChevronRight size={16} className="rtl:-scale-x-100" aria-hidden="true" /></Button>
          <Button variant="ghost" onClick={() => setDate(todayInZone(timeZone))}>{t('service.scheduling.today')}</Button>
          <div className="w-44"><Select aria-label={t('service.scheduling.fields.type')} placeholder={t('service.scheduling.anyType')} value={type} onChange={setType} options={types.map((value) => ({ value, label: t(`service.scheduling.types.${value}`) }))} /></div>
        </div>
        <Button onClick={() => setCreating(true)}><Plus size={16} aria-hidden="true" />{t('service.scheduling.newReservation')}</Button>
      </div>
      <h2 className="text-sm font-semibold text-[var(--text)]">{format.day(date)} <span className="text-xs font-normal text-[var(--text-muted)]" dir="ltr">· {timeZone}</span></h2>
      <ResourceState isLoading={resources.isLoading || reservations.isLoading} error={resources.error || reservations.error} onRetry={() => { resources.refetch(); reservations.refetch() }} empty={!visible.length} emptyTitle={t('service.scheduling.noResources')} emptyDescription={t('service.scheduling.noResourcesHint')}>
        <ResourceDayBoard resources={visible} reservations={reservations.data || []} timeZone={timeZone} onSelect={setSelected} />
        <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1.5"><span className="h-3 w-5 rounded border-2 border-brand-accent" aria-hidden="true" />{t('service.scheduling.statuses.confirmed')}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-3 w-5 rounded border-2 border-dashed border-sla-at-risk" aria-hidden="true" />{t('service.scheduling.statuses.hold')}</span>
          {holds.length > 0 && <span>{t('service.scheduling.holdsToday', { count: holds.length })}</span>}
        </div>
      </ResourceState>
      <ReservationDialog reservation={selected} onClose={() => setSelected(null)} timeZone={timeZone} workOrderPath={workOrderPath} />
      <NewReservationDialog open={creating} onClose={() => setCreating(false)} timeZone={timeZone} />
    </div>
  )
}
