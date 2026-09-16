import { BellRing, Clock3 } from 'lucide-react'

import { fieldValue, formatDateTime12, formatElapsedSince } from '../../utils/scheduleUiUtils'
import { getMeetingStatusLabel } from './MeetingFilters'

function getPriorityMeta(priority = '') {
  const value = String(priority || '').trim().toLowerCase()

  if (value === 'urgent') {
    return { label: 'Urgent', className: 'border-[#FCA5A5] bg-[#FEE2E2] text-[#991B1B]' }
  }

  if (value === 'high') {
    return { label: 'High', className: 'border-[#FCA5A5] bg-[#FEE2E2] text-[#B91C1C]' }
  }

  if (value === 'medium') {
    return { label: 'Medium', className: 'border-[#FDE68A] bg-[#FEF3C7] text-[#92400E]' }
  }

  if (value === 'low') {
    return { label: 'Low', className: 'border-[#BBF7D0] bg-[#ECFDF5] text-[#166534]' }
  }

  return { label: 'Normal', className: 'border-[#E2E8F0] bg-white text-[#475569]' }
}

function formatRemainingTime(startAt) {
  const targetDate = new Date(startAt)
  if (Number.isNaN(targetDate.getTime())) return null

  const diffMs = targetDate.getTime() - Date.now()
  const absMs = Math.abs(diffMs)
  const totalHours = Math.floor(absMs / (1000 * 60 * 60))
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24
  const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60))
  const parts = []

  if (days > 0) parts.push(`${days} يوم`)
  if (hours > 0) parts.push(`${hours} ساعة`)
  if (days === 0 && minutes > 0) parts.push(`${minutes} دقيقة`)

  const value = parts.length ? parts.join(' و ') : 'أقل من دقيقة'
  return diffMs >= 0 ? `متبقي ${value}` : `مر ${value} على موعده`
}

export function MeetingReminderBanner({ meeting }) {
  if (!meeting) return null

  const priorityMeta = getPriorityMeta(meeting.priority)
  const startedAt = meeting.actual_start_at || meeting.start_at
  const timeLabel = meeting.status === 'in_progress'
    ? (formatElapsedSince(startedAt, Date.now(), { includeSeconds: false }) || 'قيد التنفيذ')
    : formatRemainingTime(meeting.start_at)

  if (!timeLabel) return null

  return (
    <div className={`rounded-xl border bg-[#F8FEFF] px-3 py-2 shadow-sm ${meeting.priority === 'urgent' ? 'border-[#FCA5A5]' : meeting.priority === 'high' ? 'border-[#FCA5A5]' : meeting.priority === 'medium' ? 'border-[#FDE68A]' : 'border-[#BEEFF2]'}`}>
      <div className="flex min-w-0 items-start gap-2">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
          <BellRing size={15} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-xs font-black text-[var(--text)]">
              تنبيه آخر اجتماع نشط
            </span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#007A80]">
              {getMeetingStatusLabel(meeting.status)}
            </span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityMeta.className}`}>
              {priorityMeta.label}
            </span>
          </div>

          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-[11px] font-bold text-[var(--text-muted)]">
            <span className="min-w-0 truncate">
              {fieldValue(meeting.title, 'اجتماع بدون عنوان')}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5">
              <Clock3 size={12} />
              {meeting.status === 'in_progress' ? `بدأ منذ ${timeLabel}` : timeLabel}
            </span>
            <span className="rounded-full bg-white px-2 py-0.5">
              {formatDateTime12(meeting.start_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
