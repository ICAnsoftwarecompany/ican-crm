import { Activity, Clock3, Loader2, MapPin, Timer, UserRound } from 'lucide-react'

import { EmptyPanel } from '../../CustomerDetailsTabPrimitives'
import { fieldValue, formatDateTime12 } from '../../customerDetailsUtils'

function getFallbackLeadLogs(customer) {
  if (Array.isArray(customer?.lead_log)) return customer.lead_log
  if (Array.isArray(customer?.lead_logs)) return customer.lead_logs
  if (Array.isArray(customer?.lead?.lead_log)) return customer.lead.lead_log
  if (Array.isArray(customer?.lead?.logs)) return customer.lead.logs
  return []
}

function getActionLabel(action) {
  const labels = {
    created: 'إنشاء العميل',
    create_activity: 'نشاط جديد',
    status_change: 'تغيير حالة',
    call: 'مكالمة',
    meeting: 'اجتماع',
  }

  return labels[action] || fieldValue(action, 'حدث')
}

function formatResponseTime(seconds) {
  const value = Number(seconds)
  if (!Number.isFinite(value)) return null
  if (value < 60) return `${value} ثانية`
  const minutes = Math.floor(value / 60)
  const remainingSeconds = value % 60
  return remainingSeconds ? `${minutes} دقيقة و ${remainingSeconds} ثانية` : `${minutes} دقيقة`
}

function getLogNote(log) {
  return log.notes || log.note || log.description
}

function isStatusLog(log) {
  const action = String(log?.action || log?.type || '').toLowerCase()
  return (
    action.includes('status') ||
    Boolean(log?.old_status_id || log?.new_status_id || log?.old_status_title || log?.new_status_title)
  )
}

function LogActivity({ activity }) {
  return (
    <div className="rounded-lg border border-[#E5F7F8] bg-[#F8FEFF] p-2">
      <div className="text-xs font-black text-[var(--text)]">
        {activity.title || getActionLabel(activity.type)}
      </div>
      {activity.description && (
        <div className="mt-1 break-words text-[11px] font-semibold text-[var(--text-muted)]">
          {activity.description}
        </div>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-[var(--text-muted)]">
        {activity.type && <span className="rounded-full bg-white px-2 py-0.5">{getActionLabel(activity.type)}</span>}
        {activity.activity_at && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5">
            <Clock3 size={11} />
            {formatDateTime12(activity.activity_at)}
          </span>
        )}
        {activity.user?.name && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5">
            <UserRound size={11} />
            {activity.user.name}
          </span>
        )}
      </div>
    </div>
  )
}

function StatusChangeLine({ log }) {
  if (!log.old_status_title && !log.new_status_title) return null

  return (
    <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2 text-xs font-bold">
      {log.old_status_title && (
        <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[var(--text-muted)]">
          من: {log.old_status_title}
        </span>
      )}
      {log.new_status_title && (
        <span className="rounded-full border border-[#BEEFF2] bg-[#E8F9FA] px-2 py-1 text-[#007A80]">
          إلى: {log.new_status_title}
        </span>
      )}
    </div>
  )
}

export function StatusActionTab({ customer, logs = [], isLoading, error, layoutMode = 'compact' }) {
  const fallbackLogs = getFallbackLeadLogs(customer)
  const resolvedLogs = (logs.length ? logs : fallbackLogs).filter(isStatusLog)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-[#E5F7F8] bg-white p-4 text-xs font-bold text-[#007A80]">
        <Loader2 size={15} className="animate-spin" />
        جاري تحميل سجل العميل...
      </div>
    )
  }

  if (error && !resolvedLogs.length) {
    return (
      <EmptyPanel
        title="تعذر تحميل سجل العميل"
        description={error?.response?.data?.message || error?.message || 'حدث خطأ أثناء تحميل الأحداث.'}
      />
    )
  }

  if (!resolvedLogs.length) {
    return (
      <EmptyPanel
        title="لا يوجد سجل حالات"
        description="لم يتم تسجيل أحداث على هذا العميل حتى الآن."
      />
    )
  }

  return (
    <div className={layoutMode === 'wide' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
      {resolvedLogs.map((log) => {
        const action = log.action || log.type
        const note = getLogNote(log)
        const responseTime = formatResponseTime(log.response_time_seconds)
        const activities = Array.isArray(log.activities) ? log.activities : []
        const userName = log.user?.name || log.user?.username

        return (
          <div
            key={log.id || `${action}-${log.created_at}`}
            className="rounded-xl border border-[#E5F7F8] bg-white p-3 shadow-sm"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
                <Activity size={15} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <div className="text-sm font-black text-[var(--text)]">
                    {getActionLabel(action)}
                  </div>
                  {log.id && (
                    <span className="rounded-full bg-[#F8FEFF] px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">
                      #{log.id}
                    </span>
                  )}
                </div>

                <StatusChangeLine log={log} />

                {note && (
                  <div className="mt-2 break-words rounded-lg bg-[#F8FEFF] px-2 py-1.5 text-xs font-semibold text-[var(--text-muted)]">
                    {note}
                  </div>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[var(--text-muted)]">
                  {log.created_at && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FEFF] px-2 py-1">
                      <Clock3 size={12} />
                      {formatDateTime12(log.created_at)}
                    </span>
                  )}
                  {userName && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FEFF] px-2 py-1">
                      <UserRound size={12} />
                      {userName}
                    </span>
                  )}
                  {responseTime && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FEFF] px-2 py-1">
                      <Timer size={12} />
                      {responseTime}
                    </span>
                  )}
                  {log.ip && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FEFF] px-2 py-1">
                      <MapPin size={12} />
                      {log.ip}
                    </span>
                  )}
                </div>

                {activities.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {activities.map((activity) => (
                      <LogActivity key={activity.id || `${activity.type}-${activity.created_at}`} activity={activity} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
