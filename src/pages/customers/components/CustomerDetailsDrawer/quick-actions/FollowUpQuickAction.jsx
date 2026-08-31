import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarClock, GripHorizontal, MessageSquarePlus, X } from 'lucide-react'
import { toast } from 'sonner'

import { useLeadMutations } from '../../../../../features/leads/hooks/useLeads'
import { Button } from '../../../../../shared/components/ui/Button'
import { Input } from '../../../../../shared/components/ui/Input'
import { QuickActionButton } from './QuickActionButton'

const DRAG_LONG_PRESS_MS = 260

function getLeadId(customer) {
  return customer?.lead?.id ?? customer?.lead_id ?? customer?.id ?? customer?.customer?.lead_id
}

function getCustomerName(customer) {
  return customer?.name || customer?.lead?.name || customer?.email || customer?.phone || 'العميل'
}

function getStatusTitle(customer, currentStatus) {
  return (
    currentStatus?.status ||
    currentStatus?.name ||
    currentStatus?.title ||
    customer?.lead?.status?.status ||
    customer?.lead?.status?.name ||
    customer?.status?.status ||
    customer?.status?.name ||
    'متابعة على العميل'
  )
}

function formatDateTimeForApi(value) {
  if (!value) return ''
  return `${String(value).replace('T', ' ').slice(0, 16)}:00`
}

function formatDateTimeLocalInput(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function getDefaultFloatingLayout() {
  if (typeof window === 'undefined') return { x: 24, y: 96, width: 520 }

  const width = Math.min(520, window.innerWidth - 24)
  return {
    width,
    x: Math.max(12, Math.round((window.innerWidth - width) / 2)),
    y: Math.max(72, Math.round(window.innerHeight * 0.12)),
  }
}

function clampFloatingLayout(layout) {
  if (typeof window === 'undefined') return layout

  const width = Math.min(Math.max(Number(layout.width) || 520, 320), window.innerWidth - 24)
  return {
    width,
    x: Math.min(Math.max(Number(layout.x) || 12, 12), Math.max(12, window.innerWidth - width - 12)),
    y: Math.min(Math.max(Number(layout.y) || 72, 12), Math.max(12, window.innerHeight - 160)),
  }
}

function FollowUpDialog({ open, customer, currentStatus, onClose, onSaved }) {
  const mutations = useLeadMutations()
  const longPressTimerRef = useRef(null)
  const dragStateRef = useRef(null)
  const layoutRef = useRef(null)
  const [layout, setLayoutState] = useState(getDefaultFloatingLayout)
  const [isDragging, setIsDragging] = useState(false)
  const [form, setForm] = useState({
    description: '',
    note: '',
    activity_at: formatDateTimeLocalInput(new Date()),
  })

  const leadId = getLeadId(customer)
  const customerName = getCustomerName(customer)
  const canSubmit = useMemo(() => (
    Boolean(leadId && (String(form.description || '').trim() || String(form.note || '').trim()))
  ), [form.description, form.note, leadId])

  const setLayout = useCallback((nextLayout) => {
    const value = clampFloatingLayout(nextLayout)
    layoutRef.current = value
    setLayoutState(value)
  }, [])

  const clearLongPressTimer = useCallback(() => {
    if (!longPressTimerRef.current) return
    window.clearTimeout(longPressTimerRef.current)
    longPressTimerRef.current = null
  }, [])

  const stopDrag = useCallback(() => {
    clearLongPressTimer()
    dragStateRef.current = null
    setIsDragging(false)
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }, [clearLongPressTimer])

  const handlePointerMove = useCallback((event) => {
    const dragState = dragStateRef.current
    if (!dragState?.active) return

    setLayout({
      ...dragState.startLayout,
      x: dragState.startLayout.x + event.clientX - dragState.startPointer.x,
      y: dragState.startLayout.y + event.clientY - dragState.startPointer.y,
    })
  }, [setLayout])

  const beginDrag = useCallback(() => {
    const dragState = dragStateRef.current
    if (!dragState) return

    dragStateRef.current = { ...dragState, active: true }
    setIsDragging(true)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
  }, [])

  const handleHeaderPointerDown = useCallback((event) => {
    if (event.button !== undefined && event.button !== 0) return

    dragStateRef.current = {
      active: false,
      startPointer: { x: event.clientX, y: event.clientY },
      startLayout: layoutRef.current || layout,
    }

    clearLongPressTimer()
    longPressTimerRef.current = window.setTimeout(beginDrag, DRAG_LONG_PRESS_MS)
  }, [beginDrag, clearLongPressTimer, layout])

  useEffect(() => {
    layoutRef.current = layout
  }, [layout])

  useEffect(() => {
    if (!open) return undefined

    setLayout(layoutRef.current || getDefaultFloatingLayout())

    const handleResize = () => setLayout(layoutRef.current || getDefaultFloatingLayout())

    window.addEventListener('resize', handleResize)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopDrag)
    window.addEventListener('pointercancel', stopDrag)

    return () => {
      clearLongPressTimer()
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', stopDrag)
      window.removeEventListener('pointercancel', stopDrag)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [clearLongPressTimer, handlePointerMove, open, setLayout, stopDrag])

  if (!open || typeof document === 'undefined') return null

  const handleSubmit = async (event) => {
    event.preventDefault()

    const description = String(form.description || '').trim()
    const note = String(form.note || '').trim()
    const text = description || note

    if (!leadId) {
      toast.error('لا يوجد رقم Lead لهذا العميل')
      return
    }

    if (!text) {
      toast.error('اكتب المتابعة أولا')
      return
    }

    try {
      await mutations.saveAction.mutateAsync({
        lead_id: leadId,
        action: 'create_activity',
        type: 'note-to-lead',
        title: getStatusTitle(customer, currentStatus),
        description: text,
        note: note || text,
        activity_at: formatDateTimeForApi(form.activity_at || formatDateTimeLocalInput(new Date())),
      })
      toast.success('تمت إضافة المتابعة')
      onSaved?.()
      onClose?.()
      setForm({
        description: '',
        note: '',
        activity_at: formatDateTimeLocalInput(new Date()),
      })
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'تعذر إضافة المتابعة')
    }
  }

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[130000]">
      <div
        role="dialog"
        aria-modal="false"
        aria-label="إضافة متابعة"
        className="pointer-events-auto fixed overflow-hidden rounded-2xl border border-[#BEEFF2] bg-white shadow-2xl"
        dir="rtl"
        style={{
          left: 0,
          top: 0,
          width: layout.width,
          transform: `translate3d(${layout.x}px, ${layout.y}px, 0)`,
        }}
      >
        <div
          className={[
            'flex cursor-grab touch-none select-none items-center justify-between gap-3 border-b border-[#E5F7F8] bg-[#F8FEFF] px-4 py-3 active:cursor-grabbing',
            isDragging ? 'bg-[#E8F9FA]' : '',
          ].join(' ')}
          title="اضغط مطولا واسحب لتحريك النافذة"
          onPointerDown={handleHeaderPointerDown}
        >
          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-[#111827]">إضافة متابعة</h3>
            <p className="mt-0.5 truncate text-xs font-bold text-[#64748B]">{customerName}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <GripHorizontal size={17} className="text-[#64748B]" />
            <button
              type="button"
              onClick={onClose}
              onPointerDown={(event) => event.stopPropagation()}
              disabled={mutations.saveAction.isPending}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#D8E7EA] bg-white text-[#64748B] transition hover:bg-[#F8FAFC] disabled:opacity-60"
              aria-label="إغلاق"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-black text-[#111827]">نص المتابعة</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              rows={5}
              className="min-h-32 w-full resize-y rounded-xl border border-[#D8E7EA] bg-[#FBFEFF] px-3 py-2 text-sm font-bold text-[#111827] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
              placeholder="اكتب تفاصيل المتابعة مع العميل..."
              autoFocus
            />
          </label>

          <Input
            type="text"
            label="ملاحظة مختصرة"
            value={form.note}
            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
            placeholder="اختياري"
          />

          <Input
            type="datetime-local"
            label="وقت المتابعة"
            value={form.activity_at}
            onChange={(event) => setForm((current) => ({ ...current, activity_at: event.target.value }))}
            startIcon={<CalendarClock size={16} />}
          />

          <div className="flex items-center justify-end gap-2 border-t border-[#EEF2F4] pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={mutations.saveAction.isPending}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="accent"
              loading={mutations.saveAction.isPending}
              disabled={!canSubmit}
            >
              حفظ المتابعة
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export function FollowUpQuickAction({ customer, currentStatus, onFollowUpAdded }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <QuickActionButton
        icon={MessageSquarePlus}
        label="إضافة متابعة"
        accentClassName="text-[#007A80]"
        onClick={() => setOpen(true)}
      />
      <FollowUpDialog
        open={open}
        customer={customer}
        currentStatus={currentStatus}
        onClose={() => setOpen(false)}
        onSaved={() => onFollowUpAdded?.({
          customer,
          actionType: 'note',
        })}
      />
    </>
  )
}
