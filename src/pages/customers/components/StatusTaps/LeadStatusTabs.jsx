import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, PhoneCall } from 'lucide-react'
import { definitionsApi } from '../../../../features/definitions/api/definitionsApi'
import { countCustomersByStatus, extractLeadStatuses } from '../../utils/customerStatus'

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

export function LeadStatusTabs({
  selectedStatusId = null,
  onStatusChange,
  customers = [],
  onOpenMultiView,
  onStatusesChange,
  activeActivityDrawerType = null,
  onToggleActivityDrawer,
  meetingsTodayCount = 0,
  callsTodayCount = 0,
}) {
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
            كل الحالات
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
        <button
          type="button"
          onClick={() => onOpenMultiView?.()}
          className="ms-2 min-h-11 shrink-0 rounded-lg border border-[#00C2CB] bg-white px-4 py-2 text-sm font-bold text-[#007A80] transition-colors hover:bg-[#E8F9FA]"
        >
          عرض مزدوج
        </button>

        <div className="ms-2 flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleActivityDrawer?.('meeting')}
            className={`relative inline-flex h-11 w-11 items-center justify-center rounded-lg border transition-colors ${
              activeActivityDrawerType === 'meeting'
                ? 'border-[#00C2CB] bg-[#E8F9FA] text-[#007A80]'
                : 'border-[#D1E8EA] bg-white text-[#0F766E] hover:bg-[#ECFEFF]'
            }`}
            title="اجتماعات اليوم"
            aria-label="اجتماعات اليوم"
          >
            <CalendarDays size={17} />
            <span className="absolute -top-1 -end-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0F766E] px-1 text-[10px] font-black leading-none text-white">
              {meetingsTodayCount > 99 ? '99+' : meetingsTodayCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onToggleActivityDrawer?.('call')}
            className={`relative inline-flex h-11 w-11 items-center justify-center rounded-lg border transition-colors ${
              activeActivityDrawerType === 'call'
                ? 'border-[#EF4444] bg-[#FFF1F2] text-[#B91C1C]'
                : 'border-[#F9D7D7] bg-white text-[#B91C1C] hover:bg-[#FFF5F5]'
            }`}
            title="مكالمات اليوم"
            aria-label="مكالمات اليوم"
          >
            <PhoneCall size={17} />
            <span className="absolute -top-1 -end-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#B91C1C] px-1 text-[10px] font-black leading-none text-white">
              {callsTodayCount > 99 ? '99+' : callsTodayCount}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
