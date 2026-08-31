import { useEffect, useMemo, useState } from 'react'
import { Clock3, Loader2, PhoneCall, Plus, UserRound } from 'lucide-react'

import { useLeadCallsMeetings } from '../../../../../../../features/meetings/hooks/useMeetings'
import { Button } from '../../../../../../../shared/components/ui/Button'
import { fieldValue, formatDateTime12 } from '../../../customerDetailsUtils'
import { CallFilters, getCallStatusLabel } from './CallFilters'
import { CallReminderBanner } from './CallReminderBanner'
import { CallScheduleDialog } from './CallScheduleDialog'
import { ScheduleDetailsDrawer } from '../ScheduleDetails/ScheduleDetailsDrawer'

const ACTIVE_CALL_STATUSES = new Set(['scheduled', 'in_progress'])

function getLeadId(customer) {
  return customer?.lead_id || customer?.lead?.id
}

function toTime(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function formatDuration(seconds) {
  const value = Number(seconds)
  if (!Number.isFinite(value)) return null

  const minutes = Math.floor(value / 60)
  const remainingSeconds = value % 60
  if (minutes <= 0) return `${remainingSeconds} ثانية`
  return remainingSeconds ? `${minutes} دقيقة و ${remainingSeconds} ثانية` : `${minutes} دقيقة`
}

function isWithinDateRange(call, filters) {
  if (!filters.from && !filters.to) return true

  const startTime = toTime(call?.start_at)
  if (!startTime) return false

  if (filters.from) {
    const fromTime = new Date(`${filters.from}T00:00:00`).getTime()
    if (startTime < fromTime) return false
  }

  if (filters.to) {
    const toTimeValue = new Date(`${filters.to}T23:59:59`).getTime()
    if (startTime > toTimeValue) return false
  }

  return true
}

function getLatestActiveCall(calls) {
  return calls
    .filter((call) => ACTIVE_CALL_STATUSES.has(String(call?.status || '').toLowerCase()))
    .filter((call) => toTime(call?.start_at))
    .sort((first, second) => toTime(second.start_at) - toTime(first.start_at))[0]
}

function CallCard({ call, onOpenDetails }) {
  const creatorName = call?.creator?.name || call?.creator?.username
  const participants = Array.isArray(call?.participants) ? call.participants : []
  const duration = formatDuration(call?.call_duration_seconds)

  return (
    <button
      type="button"
      onClick={() => onOpenDetails?.(call)}
      className="block w-full rounded-xl border border-[#E5F7F8] bg-white p-3 text-start shadow-sm transition hover:border-[#00C2CB] hover:shadow-md"
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
          <PhoneCall size={16} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h4 className="min-w-0 truncate text-sm font-black text-[var(--text)]">
              {fieldValue(call?.title, 'مكالمة بدون عنوان')}
            </h4>
            <span className="rounded-full bg-[#F8FEFF] px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">
              {getCallStatusLabel(call?.status)}
            </span>
            {call?.priority && (
              <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-bold text-[#92400E]">
                {call.priority}
              </span>
            )}
          </div>

          {call?.description && (
            <p className="mt-1 break-words text-xs font-semibold text-[var(--text-muted)]">
              {call.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[var(--text-muted)]">
            {call?.start_at && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FEFF] px-2 py-1">
                <Clock3 size={12} />
                يبدأ: {formatDateTime12(call.start_at)}
              </span>
            )}
            {call?.end_at && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FEFF] px-2 py-1">
                <Clock3 size={12} />
                ينتهي: {formatDateTime12(call.end_at)}
              </span>
            )}
            {creatorName && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FEFF] px-2 py-1">
                <UserRound size={12} />
                {creatorName}
              </span>
            )}
            {duration && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FEFF] px-2 py-1">
                <Clock3 size={12} />
                {duration}
              </span>
            )}
            {call?.call_provider && (
              <span className="rounded-full bg-[#F8FEFF] px-2 py-1">
                {call.call_provider}
              </span>
            )}
          </div>

          {participants.length > 0 && (
            <div className="mt-2 text-[11px] font-semibold text-[var(--text-muted)]">
              المشاركون: {participants.map((participant) => (
                participant?.user?.name || participant?.user?.username || `#${participant?.user_id}`
              )).filter(Boolean).join('، ')}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

export function CallsActionTab({ customer, onChanged, actionRequest, layoutMode = 'compact' }) {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [selectedCall, setSelectedCall] = useState(null)
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    status: '',
  })
  const leadId = getLeadId(customer)
  const callsQuery = useLeadCallsMeetings(leadId, undefined, {
    enabled: Boolean(leadId),
  })

  const calls = useMemo(() => (
    (callsQuery.data || [])
      .filter((item) => String(item?.type || '').toLowerCase() === 'call')
      .sort((first, second) => toTime(second?.start_at) - toTime(first?.start_at))
  ), [callsQuery.data])

  const filteredCalls = useMemo(() => (
    calls.filter((call) => {
      const status = String(call?.status || '').toLowerCase()
      const matchesStatus = filters.status ? status === filters.status : true

      return matchesStatus && isWithinDateRange(call, filters)
    })
  ), [calls, filters])

  const latestActiveCall = useMemo(() => getLatestActiveCall(calls), [calls])
  const hasActiveFilters = Boolean(filters.from || filters.to || filters.status)

  useEffect(() => {
    if (actionRequest?.actionId !== 'call') return
    if (actionRequest?.intent !== 'schedule') return
    setIsScheduleDialogOpen(true)
  }, [actionRequest])

  const updateFilters = (nextFilters) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      ...nextFilters,
    }))
  }

  const resetFilters = () => {
    setFilters({
      from: '',
      to: '',
      status: '',
    })
  }

  const handleCreated = (result, payload) => {
    callsQuery.refetch()
    onChanged?.({
      customer,
      actionType: 'activity',
      activityType: 'call',
      activityTitle: payload?.title || result?.data?.title || 'موعد مكالمة',
    })
  }

  const handleDetailsChanged = () => {
    callsQuery.refetch()
    onChanged?.({
      customer,
      actionType: 'activity',
      activityType: 'call',
      activityTitle: 'تحديث بيانات المكالمة',
    })
  }

  if (!leadId) {
    return (
      <div className="rounded-lg border border-[#E5F7F8] bg-white px-3 py-2 text-xs font-semibold text-[var(--text-muted)]">
        لا يوجد Lead مرتبط بهذا العميل.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CallFilters
          filters={filters}
          onChange={updateFilters}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <Button
          type="button"
          size="sm"
          variant="ai"
          onClick={() => setIsScheduleDialogOpen(true)}
          className="shrink-0 justify-center gap-2"
        >
          <Plus size={14} />
          إضافة موعد مكالمة
        </Button>
      </div>

      <CallReminderBanner call={latestActiveCall} />

      <div className="space-y-2 border-t border-[#E5F7F8] pt-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-black text-[var(--text)]">المكالمات المسجلة</h3>
          <span className="rounded-full bg-[#F8FEFF] px-2 py-1 text-[11px] font-bold text-[var(--text-muted)]">
            {hasActiveFilters ? `${filteredCalls.length} / ${calls.length}` : calls.length}
          </span>
        </div>

        {callsQuery.isLoading && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-[#E5F7F8] bg-white p-4 text-xs font-bold text-[#007A80]">
            <Loader2 size={15} className="animate-spin" />
            جاري تحميل المكالمات...
          </div>
        )}

        {callsQuery.isError && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-bold text-red-700">
            تعذر تحميل المكالمات.
          </div>
        )}

        {!callsQuery.isLoading && !callsQuery.isError && filteredCalls.length === 0 && (
          <div className="rounded-xl border border-[#E5F7F8] bg-[#F8FEFF] p-4 text-center text-xs font-semibold text-[var(--text-muted)]">
            لا توجد مكالمات مطابقة للفلاتر الحالية.
          </div>
        )}

        {!callsQuery.isLoading && !callsQuery.isError && filteredCalls.length > 0 && (
          <div className={layoutMode === 'wide' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
            {filteredCalls.map((call) => (
              <CallCard key={call.id} call={call} onOpenDetails={setSelectedCall} />
            ))}
          </div>
        )}
      </div>

      <CallScheduleDialog
        isOpen={isScheduleDialogOpen}
        onClose={() => setIsScheduleDialogOpen(false)}
        customer={customer}
        leadId={leadId}
        onCreated={handleCreated}
      />
      <ScheduleDetailsDrawer
        open={Boolean(selectedCall)}
        onClose={() => setSelectedCall(null)}
        schedule={selectedCall}
        customer={customer}
        onChanged={handleDetailsChanged}
      />
    </div>
  )
}
