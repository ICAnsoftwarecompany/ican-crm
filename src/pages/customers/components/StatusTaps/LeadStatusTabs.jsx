import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { definitionsApi } from '../../../../features/definitions/api/definitionsApi'
import { countCustomersByStatus, extractLeadStatuses, filterCustomersByStatusId, NO_CUSTOMER_STATUS_ID } from '../../utils/customerStatus'
import { useTranslation } from 'react-i18next'

function CountBadge({ count, active, pulse = false }) {
  return (
    <span className={`ms-2 inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold transition-all duration-500 ${
      pulse
        ? 'bg-emerald-500 text-white scale-110 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]'
        : active
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
  recentStatusChange = null,
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

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
      <style>{`
        .lead-stage-tab {
          clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 16px 50%);
        }

        @keyframes lead-stage-arrival {
          0%, 100% { transform: translateY(0) scale(1); }
          18% { transform: translateY(-3px) scale(1.12); }
          42% { transform: translateY(0) scale(1.04); }
          65% { transform: translateY(-2px) scale(1.09); }
        }
        @keyframes lead-stage-name-glow {
          0%, 100% { background: transparent; }
          20%, 70% { background: rgba(16, 185, 129, 0.22); }
        }
        .lead-stage-arrived { animation: lead-stage-arrival 1.2s ease-in-out 2; z-index: 10; }
        .lead-stage-arrived-name { animation: lead-stage-name-glow 1.2s ease-in-out 2; }
        @media (prefers-reduced-motion: reduce) {
          .lead-stage-arrived, .lead-stage-arrived-name { animation: none; }
        }
        [dir="rtl"] .lead-stage-tab {
          clip-path: polygon(16px 0, 100% 0, calc(100% - 16px) 50%, 100% 100%, 16px 100%, 0 50%);
        }
      `}</style>
      <div className="flex overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onStatusChange?.(null)}
          className={`lead-stage-tab relative min-h-11 shrink-0 border px-6 py-2 text-sm font-medium transition-all duration-500 ${
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

        {[{ id: NO_CUSTOMER_STATUS_ID, status: t('customers.page.noStatus'), color: '#94A3B8' }, ...statuses].map((status) => {
          const isSelected = String(selectedStatusId) === String(status.id)
          const color = status.color || '#64748B'
          const justChanged = recentStatusChange?.id === String(status.id)

          return (
            <button
              key={status.id}
              type="button"
              onClick={() => onStatusChange?.(status)}
              className={`lead-stage-tab relative -ms-3 min-h-11 shrink-0 border px-6 py-2 text-sm font-medium transition-all duration-300 ${justChanged ? 'lead-stage-arrived' : ''} ${
                justChanged
                  ? 'border-emerald-500 bg-emerald-100 text-emerald-900 shadow-[inset_0_0_0_2px_#10b981,0_8px_24px_rgba(16,185,129,0.32)] dark:bg-emerald-900/40 dark:text-emerald-100'
                  : isSelected
                  ? 'border-[#00C2CB] bg-[#E8F9FA] text-[#007A80] shadow-sm'
                  : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:bg-[#F8FAFF]'
              }`}
              title={status.status}
            >
              <span className={`inline-flex items-center rounded-lg px-1 py-0.5 font-semibold transition-all duration-300 ${justChanged ? 'lead-stage-arrived-name text-emerald-800 dark:text-emerald-100' : ''}`}>
                {status.status}
                <CountBadge count={status.id === NO_CUSTOMER_STATUS_ID ? filterCustomersByStatusId(customers, NO_CUSTOMER_STATUS_ID).length : countByStatusId[String(status.id)] || 0} active={isSelected} pulse={justChanged} />
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
