import { useTranslation } from 'react-i18next'

import { formatBackendDateShort, formatBackendTime12 } from '../utils/backendLocalDate'

const ACTIVITY_RANGE_VALUES = [1, 7, 15, 30]

function getActivityRangeOptions(t) {
  return ACTIVITY_RANGE_VALUES.map((value) => ({
    value,
    label: value === 1
      ? (t ? t('customers.table.range.today') : 'Today')
      : (t ? t('activities.duration.day', { count: value }) : `${value} days`),
  }))
}

function getActivityRangeLabel(rangeDays, t) {
  const option = getActivityRangeOptions(t).find((item) => Number(item.value) === Number(rangeDays))
  return option?.label || (t ? t('activities.duration.day', { count: rangeDays }) : `${rangeDays} days`)
}

function getActivityStatusLabel(status = '', t) {
  if (status === 'scheduled') return t ? t('activities.status.scheduled') : 'Scheduled'
  if (status === 'in_progress') return t ? t('activities.status.in_progress') : 'In Progress'
  if (status === 'completed') return t ? t('activities.status.completed') : 'Completed'
  if (status === 'cancelled') return t ? t('activities.status.cancelled') : 'Cancelled'
  return status || '-'
}

/** Side panel next to the Leads Center table listing meetings or calls in a day range. */
export function CustomersActivitySidePanel({
  type,
  items = [],
  rangeDays,
  onRangeChange,
  statusFilter,
  onStatusFilterChange,
  onSelectItem,
  onClose,
}) {
  const { t } = useTranslation()
  const statusOptions = [
    { value: 'all', label: t('customers.page.allStatuses') },
    { value: 'scheduled', label: t('activities.status.scheduled') },
    { value: 'in_progress', label: t('activities.status.in_progress') },
    { value: 'completed', label: t('activities.status.completed') },
    { value: 'cancelled', label: t('activities.status.cancelled') },
  ]

  return (
    <aside className="min-w-0 rounded-xl border border-[#D7EEF0] bg-white shadow-sm xl:sticky xl:top-16 xl:h-[calc(100vh-7rem)] xl:overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#E8EEF0] px-3 py-2">
        <div className="text-sm font-black text-[var(--text)]">
          {type === 'meeting' ? t('customers.table.meetingsGroupLabel') : t('customers.table.callsGroupLabel')} {getActivityRangeLabel(rangeDays, t)}
        </div>
        <div className="inline-flex items-center gap-2">
          <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-xs font-black text-[#334155]">
            {items.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#E2E8F0] px-2 py-1 text-xs font-bold text-[#475569] transition-colors hover:bg-[#F8FAFC]"
          >
            {t('customers.page.close')}
          </button>
        </div>
      </div>

      <div className="border-b border-[#E8EEF0] px-2 py-2">
        <div className="grid grid-cols-4 gap-1 rounded-lg bg-[#F8FAFC] p-1">
          {getActivityRangeOptions(t).map((option) => {
            const isSelected = Number(option.value) === Number(rangeDays)

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onRangeChange(option.value)}
                className={`rounded-md px-2 py-1.5 text-[11px] font-black transition-colors ${
                  isSelected
                    ? type === 'meeting'
                      ? 'bg-[#E8F9FA] text-[#007A80] shadow-sm'
                      : 'bg-[#FFF1F2] text-[#B91C1C] shadow-sm'
                    : 'text-[#64748B] hover:bg-white'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="border-b border-[#E8EEF0] px-2 py-2">
        <div className="flex flex-wrap gap-1.5">
          {statusOptions.map((option) => {
            const isSelected = statusFilter === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onStatusFilterChange(option.value)}
                className={`rounded-full border px-2.5 py-1 text-[10px] font-black transition-colors ${
                  isSelected
                    ? type === 'meeting'
                      ? 'border-[#BEEFF2] bg-[#E8F9FA] text-[#007A80]'
                      : 'border-[#F8C3C3] bg-[#FFF1F2] text-[#B91C1C]'
                    : 'border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC]'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2 p-2 xl:h-[calc(100%-98px)] xl:overflow-y-auto">
        {items.length ? items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectItem(item)}
            className={`block w-full rounded-lg border px-2.5 py-2 text-left transition-colors ${
              type === 'meeting'
                ? 'border-[#D7EEF0] bg-[#F8FEFF] hover:bg-[#F0FEFF]'
                : 'border-[#FADADA] bg-[#FFF8F8] hover:bg-[#FFF2F2]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-xs font-black text-[var(--text)]">{item.customerName}</div>
                <div className="truncate text-[11px] font-semibold text-[var(--text-muted)]">{item.title}</div>
              </div>
              <div className={`shrink-0 text-[11px] font-black ${type === 'meeting' ? 'text-[#0F766E]' : 'text-[#B91C1C]'}`}>
                {formatBackendTime12(item.startAt, t)}
              </div>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-[#64748B]">
              <span>{getActivityStatusLabel(item.status, t)}</span>
              {rangeDays > 1 ? (
                <span className="rounded-full bg-white px-1.5 py-0.5 text-[#475569] ring-1 ring-[#E2E8F0]">
                  {formatBackendDateShort(item.startAt)}
                </span>
              ) : null}
            </div>
          </button>
        )) : (
          <div className="rounded-lg border border-dashed border-[#D7EEF0] px-2 py-3 text-center text-xs font-semibold text-[var(--text-muted)]">
            {type === 'meeting'
              ? t('customers.page.noMeetingsInRange', { range: getActivityRangeLabel(rangeDays, t) })
              : t('customers.page.noCallsInRange', { range: getActivityRangeLabel(rangeDays, t) })}
          </div>
        )}
      </div>
    </aside>
  )
}
