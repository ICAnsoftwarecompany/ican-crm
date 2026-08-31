import { BellRing, Clock3 } from 'lucide-react'

import { fieldValue, formatDateTime12 } from '../../../customerDetailsUtils'
import { getCallStatusLabel } from './CallFilters'

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
  return diffMs >= 0 ? `متبقي ${value}` : `مر ${value} على موعدها`
}

export function CallReminderBanner({ call }) {
  if (!call) return null

  const remainingText = formatRemainingTime(call.start_at)
  if (!remainingText) return null

  return (
    <div className="rounded-xl border border-[#BEEFF2] bg-[#F8FEFF] px-3 py-2 shadow-sm">
      <div className="flex min-w-0 items-start gap-2">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
          <BellRing size={15} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-xs font-black text-[var(--text)]">
              تنبيه آخر مكالمة نشطة
            </span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#007A80]">
              {getCallStatusLabel(call.status)}
            </span>
          </div>

          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-[11px] font-bold text-[var(--text-muted)]">
            <span className="min-w-0 truncate">
              {fieldValue(call.title, 'مكالمة بدون عنوان')}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5">
              <Clock3 size={12} />
              {remainingText}
            </span>
            <span className="rounded-full bg-white px-2 py-0.5">
              {formatDateTime12(call.start_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
