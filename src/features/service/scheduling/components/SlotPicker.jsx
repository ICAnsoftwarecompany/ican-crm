import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { Spinner } from '../../../../shared/components/ui/Spinner'
import { cn } from '../../../../shared/utils/cn'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { RESOURCE_TYPES } from '../../settings/resources/schedulingResources'
import { useAvailability } from '../api/schedulingApi'
import { todayInZone, useZonedFormat } from '../utils/zonedTime'

const DURATIONS = [30, 60, 90, 120, 180]

/**
 * Reusable slot finder (spec §19.4): filters → server availability → pick one slot.
 * Used by reservations and by work-order scheduling (`resourceType` fixed to technician there).
 */
export function SlotPicker({ value, onChange, resourceType, defaultDuration = 60, timeZone }) {
  const { t, i18n } = useTranslation()
  const format = useZonedFormat(timeZone)
  const [filters, setFilters] = useState({ date: todayInZone(timeZone), resource_type: resourceType || '', skill: '', zone: '', duration: defaultDuration })
  const set = (name) => (next) => setFilters((current) => ({ ...current, [name]: next }))
  const params = { date: filters.date, resource_type: filters.resource_type || undefined, skill: filters.skill.trim() || undefined, zone: filters.zone.trim() || undefined, duration: filters.duration }
  const slots = useAvailability(params)
  const grouped = useMemo(() => {
    const map = new Map()
    ;(slots.data || []).forEach((slot) => {
      if (!map.has(slot.resource_id)) map.set(slot.resource_id, { name: slot.resource_name, slots: [] })
      map.get(slot.resource_id).slots.push(slot)
    })
    return [...map.entries()]
  }, [slots.data])
  const selected = (slot) => value && value.resource_id === slot.resource_id && value.starts_at === slot.starts_at

  return (
    <div className="grid gap-3">
      <div className="grid gap-2 sm:grid-cols-5">
        <Input type="date" dir="ltr" label={t('service.scheduling.fields.date')} value={filters.date} onChange={(event) => set('date')(event.target.value)} />
        <Select label={t('service.scheduling.fields.type')} value={filters.resource_type} disabled={Boolean(resourceType)} placeholder={t('service.scheduling.anyType')} onChange={set('resource_type')} options={RESOURCE_TYPES.map((type) => ({ value: type, label: t(`service.scheduling.types.${type}`) }))} />
        <Input dir="ltr" label={t('service.scheduling.fields.skill')} value={filters.skill} onChange={(event) => set('skill')(event.target.value)} />
        <Input dir="ltr" label={t('service.scheduling.fields.zone')} value={filters.zone} onChange={(event) => set('zone')(event.target.value)} />
        <Select label={t('service.scheduling.fields.duration')} value={String(filters.duration)} onChange={(next) => set('duration')(Number(next) || 60)} options={DURATIONS.map((minutes) => ({ value: String(minutes), label: t('service.scheduling.minutes', { count: minutes }) }))} />
      </div>
      <div className="grid max-h-72 gap-3 overflow-y-auto rounded-lg border border-[var(--border)] p-3">
        {slots.isLoading ? (
          <div className="flex justify-center py-4"><Spinner /></div>
        ) : slots.isError ? (
          <p className="text-sm text-sla-breached">{t('service.scheduling.slotsError')}</p>
        ) : !grouped.length ? (
          <p className="text-sm text-[var(--text-muted)]">{t('service.scheduling.noSlots')}</p>
        ) : (
          grouped.map(([resourceId, group]) => (
            <div key={resourceId} className="grid gap-1.5">
              <p className="text-xs font-semibold text-[var(--text)]">{localizeLabel(group.name, i18n.language, resourceId)}</p>
              <div className="flex flex-wrap gap-1.5" role="listbox" aria-label={localizeLabel(group.name, i18n.language, resourceId)}>
                {group.slots.map((slot) => (
                  <button
                    key={slot.starts_at}
                    type="button"
                    role="option"
                    aria-selected={selected(slot)}
                    onClick={() => onChange({ ...slot, duration: filters.duration })}
                    className={cn('rounded-md border px-2 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent', selected(slot) ? 'border-brand-accent bg-[var(--surface-2)] font-semibold text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]')}
                  >
                    {format.time(slot.starts_at)}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
