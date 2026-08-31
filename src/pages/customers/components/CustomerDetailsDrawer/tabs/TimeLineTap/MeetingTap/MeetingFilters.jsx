import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarDays, RotateCcw } from 'lucide-react'

import { Button } from '../../../../../../../shared/components/ui/Button'

const DATE_MENU_WIDTH = 256
const DATE_MENU_HEIGHT = 236
const VIEWPORT_PADDING = 8

export const MEETING_STATUS_LABELS = {
  scheduled: 'مجدول',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي',
}

export function getMeetingStatusLabel(status) {
  return MEETING_STATUS_LABELS[String(status || '').toLowerCase()] || status || 'غير محدد'
}

function getDateMenuPosition(buttonElement) {
  if (!buttonElement) return { top: VIEWPORT_PADDING, left: VIEWPORT_PADDING }

  const rect = buttonElement.getBoundingClientRect()
  const maxLeft = window.innerWidth - DATE_MENU_WIDTH - VIEWPORT_PADDING
  const preferredLeft = rect.right - DATE_MENU_WIDTH
  const left = Math.max(VIEWPORT_PADDING, Math.min(preferredLeft, maxLeft))
  const bottomTop = rect.bottom + VIEWPORT_PADDING
  const top = bottomTop + DATE_MENU_HEIGHT > window.innerHeight
    ? Math.max(VIEWPORT_PADDING, rect.top - DATE_MENU_HEIGHT - VIEWPORT_PADDING)
    : bottomTop

  return { top, left }
}

function DateFilterMenu({ position, filters, onChange, onClose }) {
  return createPortal(
    <div
      className="fixed z-[99999] w-64 rounded-xl border border-[#D9F3F5] bg-white p-3 shadow-2xl"
      style={{ top: position.top, left: position.left }}
      data-meeting-date-filter-menu="true"
    >
      <div className="space-y-3">
        <label className="block space-y-1 text-xs font-bold text-[var(--text)]">
          <span>من تاريخ</span>
          <input
            type="date"
            value={filters.from}
            onChange={(event) => onChange({ from: event.target.value })}
            className="h-9 w-full rounded-lg border border-[var(--border)] bg-white px-2 text-xs font-semibold text-[var(--text)] outline-none focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
          />
        </label>

        <label className="block space-y-1 text-xs font-bold text-[var(--text)]">
          <span>إلى تاريخ</span>
          <input
            type="date"
            value={filters.to}
            onChange={(event) => onChange({ to: event.target.value })}
            className="h-9 w-full rounded-lg border border-[var(--border)] bg-white px-2 text-xs font-semibold text-[var(--text)] outline-none focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
          />
        </label>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onChange({ from: '', to: '' })}
            className="h-8 text-[11px]"
          >
            مسح التاريخ
          </Button>
          <Button type="button" size="sm" variant="ai" onClick={onClose} className="h-8 text-[11px]">
            تطبيق
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function MeetingFilters({ filters, onChange, onReset, hasActiveFilters }) {
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [dateMenuPosition, setDateMenuPosition] = useState({ top: VIEWPORT_PADDING, left: VIEWPORT_PADDING })
  const dateButtonRef = useRef(null)

  const updateDateMenuPosition = useCallback(() => {
    setDateMenuPosition(getDateMenuPosition(dateButtonRef.current))
  }, [])

  useEffect(() => {
    if (!isDateOpen) return undefined

    updateDateMenuPosition()

    const handlePointerDown = (event) => {
      const clickedButton = dateButtonRef.current?.contains(event.target)
      const clickedMenu = event.target?.closest?.('[data-meeting-date-filter-menu="true"]')

      if (clickedButton || clickedMenu) return
      setIsDateOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('resize', updateDateMenuPosition)
    window.addEventListener('scroll', updateDateMenuPosition, true)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('resize', updateDateMenuPosition)
      window.removeEventListener('scroll', updateDateMenuPosition, true)
    }
  }, [isDateOpen, updateDateMenuPosition])

  const dateButtonLabel = filters.from || filters.to ? 'تاريخ محدد' : 'فلتر التاريخ'

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <button
        ref={dateButtonRef}
        type="button"
        onClick={() => {
          updateDateMenuPosition()
          setIsDateOpen((value) => !value)
        }}
        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#D9F3F5] bg-white px-2.5 text-[11px] font-bold text-[#007A80] shadow-sm transition hover:bg-[#F8FEFF]"
        title="فلترة الاجتماعات بتاريخ البداية"
      >
        <CalendarDays size={14} />
        {dateButtonLabel}
      </button>

      {isDateOpen && (
        <DateFilterMenu
          position={dateMenuPosition}
          filters={filters}
          onChange={onChange}
          onClose={() => setIsDateOpen(false)}
        />
      )}

      <select
        value={filters.status}
        onChange={(event) => onChange({ status: event.target.value })}
        className="h-8 min-w-32 rounded-lg border border-[#D9F3F5] bg-white px-2 text-[11px] font-bold text-[var(--text)] shadow-sm outline-none focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
        title="فلترة حسب حالة الاجتماع"
      >
        <option value="">كل الحالات</option>
        <option value="scheduled">مجدول</option>
        <option value="in_progress">قيد التنفيذ</option>
        <option value="completed">مكتمل</option>
        <option value="cancelled">ملغي</option>
      </select>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[#E2E6F0] bg-white px-2 text-[11px] font-bold text-[var(--text-muted)] transition hover:bg-[#F8FAFF] hover:text-[var(--text)]"
          title="مسح فلاتر الاجتماعات"
        >
          <RotateCcw size={13} />
          مسح
        </button>
      )}
    </div>
  )
}
