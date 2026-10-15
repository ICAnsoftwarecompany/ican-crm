import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { definitionsApi } from '../../../../features/definitions/api/definitionsApi'
import { countCustomersByStatus, extractLeadStatuses } from '../../utils/customerStatus'
import { useTranslation } from 'react-i18next'

function CountBadge({ count, active }) {
  return (
    <span className={`ms-2 inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold ${
      active
        ? 'bg-[#00C2CB] text-white'
        : 'bg-white text-[var(--text-muted)] ring-1 ring-[var(--border)]'
    }`}>
      {count}
    </span>
  )
}

/** Lead status tabs. The multi-status, meetings and calls buttons moved to the header (CustomersHeaderTools, 2026-10-15). */
export function LeadStatusTabs({
  selectedStatusId = null,
  onStatusChange,
  customers = [],
  onStatusesChange,
}) {
  const { t } = useTranslation()
  const statusesQuery = useQuery({
    queryKey: ['customers', 'lead-status-tabs'],
    queryFn: () => definitionsApi.getStatuses(),
    staleTime: 1000 * 60,
  })

  const statuses = useMemo(
    () => extractLeadStatuses(statusesQuery.data),
    [statusesQuery.data]
  )

  useEffect(() => {
    onStatusesChange?.(statuses)
  }, [onStatusesChange, statuses])

  const countByStatusId = useMemo(
    () => countCustomersByStatus(customers),
    [customers]
  )
  const totalCustomers = customers.length

  if (statusesQuery.isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-10 w-28 animate-pulse rounded-lg bg-[var(--surface-2)]" />
        ))}
      </div>
    )
  }

  if (statusesQuery.isError || statuses.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
      <style>{`
        .lead-stage-tab {
          clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 16px 50%);
        }

        [dir="rtl"] .lead-stage-tab {
          clip-path: polygon(16px 0, 100% 0, calc(100% - 16px) 50%, 100% 100%, 16px 100%, 0 50%);
        }
      `}</style>
      <div className="flex overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onStatusChange?.(null)}
          className={`lead-stage-tab relative min-h-11 shrink-0 border px-6 py-2 text-sm font-medium transition-colors ${
            selectedStatusId === null
              ? 'border-[#00C2CB] bg-[#E8F9FA] text-[#007A80] shadow-sm'
              : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:bg-[#F8FAFF]'
          }`}
        >
          <span className="inline-flex items-center">
            {t('customers.page.allStatuses')}
            <CountBadge count={totalCustomers} active={selectedStatusId === null} />
          </span>
          <span className="absolute inset-x-5 bottom-1 h-1 rounded-full bg-slate-300" />
        </button>

        {statuses.map((status) => {
          const isSelected = String(selectedStatusId) === String(status.id)
          const color = status.color || '#64748B'

          return (
            <button
              key={status.id}
              type="button"
              onClick={() => onStatusChange?.(status)}
              className={`lead-stage-tab relative -ms-3 min-h-11 shrink-0 border px-6 py-2 text-sm font-medium transition-colors ${
                isSelected
                  ? 'border-[#00C2CB] bg-[#E8F9FA] text-[#007A80] shadow-sm'
                  : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:bg-[#F8FAFF]'
              }`}
              title={status.status}
            >
              <span className="inline-flex items-center">
                {status.status}
                <CountBadge count={countByStatusId[String(status.id)] || 0} active={isSelected} />
              </span>
              <span
                className="absolute inset-x-5 bottom-1 h-1 rounded-full"
                style={{ backgroundColor: color }}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
