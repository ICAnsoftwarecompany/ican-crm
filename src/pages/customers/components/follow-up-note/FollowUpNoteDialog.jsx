import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarClock, CheckCircle2, ChevronDown, GripHorizontal, X } from 'lucide-react'
import { toast } from 'sonner'

import { useLeadMutations } from '../../../../features/leads/hooks/useLeads'
import { useMeetingMutations } from '../../../../features/meetings/hooks/useMeetings'
import { useProducts } from '../../../../features/products/hooks/useProducts'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { cn } from '../../../../shared/utils/cn'
import { FollowUpScheduleSection } from './FollowUpScheduleSection'
import { FollowUpInterestedProductSection } from './FollowUpInterestedProductSection'

const DRAG_LONG_PRESS_MS = 260

const RESULT_OPTIONS = [
  { value: '', label: 'بدون نتيجة' },
  { value: 'no_answer', label: 'لم يتم الرد' },
  { value: 'answered', label: 'تم الرد' },
  { value: 'interested', label: 'مهتم' },
  { value: 'not_interested', label: 'غير مهتم' },
  { value: 'follow_up', label: 'متابعة لاحقة' },
]

function getLead(customer) {
  return customer?.lead || {}
}

function getLeadId(customer) {
  const lead = getLead(customer)
  const explicitLeadId = lead?.id ?? customer?.lead_id ?? lead?.lead_id ?? customer?.customer?.lead_id
  if (explicitLeadId !== null && explicitLeadId !== undefined && explicitLeadId !== '') return explicitLeadId

  const looksLikeCustomerRecord = customer?.customer_id || customer?.customer || 'is_deal' in (customer || {})
  return looksLikeCustomerRecord ? '' : customer?.id
}

function getCustomerName(customer) {
  const lead = getLead(customer)
  return customer?.name || lead?.name || customer?.email || lead?.email || customer?.phone || lead?.phone || 'العميل'
}

function getAssignedUserId(customer) {
  return customer?.linked_by?.id || customer?.lead?.assigned_to || customer?.agent_id || ''
}

function getCustomerPhone(customer) {
  const lead = getLead(customer)
  return lead?.phone || customer?.phone || ''
}

function getStatusLabel(status) {
  return status?.status || status?.name || status?.title || ''
}

function isStatusNoteRequired(status) {
  return Number(status?.has_resone ?? status?.has_reason ?? 0) === 1
}

function getCurrentStatusId(customer) {
  const lead = getLead(customer)
  return lead?.status_type_id ?? customer?.status_type_id ?? lead?.status?.id ?? customer?.status?.id ?? ''
}

function resolveCurrentStatus(customer, statuses = [], currentStatus) {
  if (currentStatus) return currentStatus

  const currentStatusId = getCurrentStatusId(customer)
  if (currentStatusId !== null && currentStatusId !== undefined && currentStatusId !== '') {
    const status = statuses.find((item) => String(item?.id) === String(currentStatusId))
    if (status) return status
  }

  return getLead(customer)?.status || customer?.status || null
}

function getFallbackTitle(customer, statuses, currentStatus) {
  const status = resolveCurrentStatus(customer, statuses, currentStatus)
  return getStatusLabel(status) || 'متابعة على العميل'
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
  if (typeof window === 'undefined') return { x: 24, y: 96, width: 980, height: 760 }

  const width = Math.min(980, window.innerWidth - 24)
  const estimatedHeight = Math.min(760, window.innerHeight - 24)
  return {
    width,
    height: estimatedHeight,
    x: Math.max(12, Math.round((window.innerWidth - width) / 2)),
    y: Math.max(12, Math.round((window.innerHeight - estimatedHeight) / 2)),
  }
}

function clampFloatingLayout(layout) {
  if (typeof window === 'undefined') return layout

  const width = Math.min(Math.max(Number(layout.width) || 980, 420), window.innerWidth - 24)
  const height = Math.min(Math.max(Number(layout.height) || 760, 420), window.innerHeight - 24)
  return {
    width,
    height,
    x: Math.min(Math.max(Number(layout.x) || 12, 12), Math.max(12, window.innerWidth - width - 12)),
    y: Math.min(Math.max(Number(layout.y) || 72, 12), Math.max(12, window.innerHeight - height - 12)),
  }
}

function buildDataPayload(form) {
  const data = {}
  const duration = Number(form.duration)
  const result = String(form.result || '').trim()

  if (Number.isFinite(duration) && duration > 0) data.duration = duration
  if (result) data.result = result

  return data
}

function getSavedActivityId(response) {
  if (!response || typeof response !== 'object') return ''

  const candidates = [
    response.id,
    response.activity_id,
    response.note_id,
    response.data?.id,
    response.activity?.id,
    response.note?.id,
    response.result?.id,
    response.lead_activity?.id,
    response.data?.activity_id,
    response.data?.note_id,
  ]

  const match = candidates.find((value) => value !== undefined && value !== null && value !== '')
  return match === undefined || match === null ? '' : String(match)
}

export function FollowUpNoteDialog({
  open,
  customer,
  currentStatus,
  statuses = [],
  onClose,
  onSaved,
}) {
  const mutations = useLeadMutations()
  const meetingMutations = useMeetingMutations()
  const productsQuery = useProducts()
  const longPressTimerRef = useRef(null)
  const dragStateRef = useRef(null)
  const resizeStateRef = useRef(null)
  const layoutRef = useRef(null)
  const [layout, setLayoutState] = useState(getDefaultFloatingLayout)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    note: '',
    duration: '',
    result: '',
    shouldChangeStatus: false,
    new_status_id: '',
    schedule_enabled: false,
    schedule_type: 'none',
    schedule_title: '',
    schedule_description: '',
    schedule_mode: 'online',
    schedule_meeting_link: '',
    schedule_location: '',
    schedule_call_provider: 'manual',
    schedule_caller_number: '',
    schedule_callee_number: '',
    schedule_priority: 'high',
    schedule_start_at: formatDateTimeLocalInput(new Date()),
    schedule_end_at: formatDateTimeLocalInput(new Date(Date.now() + 60 * 60 * 1000)),
    schedule_reminder_type: 'both',
    schedule_reminder_before: '1',
    schedule_reminder_unit: 'minutes',
    activity_at: formatDateTimeLocalInput(new Date()),
    interest_enabled: false,
    interest_product_id: '',
    interest_level: 'high',
    interest_note: '',
  })

  const leadId = getLeadId(customer)
  const customerName = getCustomerName(customer)
  const resolvedCurrentStatus = useMemo(
    () => resolveCurrentStatus(customer, statuses, currentStatus),
    [currentStatus, customer, statuses]
  )
  const oldStatusTitle = getStatusLabel(resolvedCurrentStatus)
  const selectedStatus = useMemo(
    () => statuses.find((status) => String(status?.id) === String(form.new_status_id)) || null,
    [form.new_status_id, statuses]
  )
  const products = productsQuery.data || []
  const selectedInterestedProduct = useMemo(
    () => products.find((product) => String(product?.id) === String(form.interest_product_id)) || null,
    [form.interest_product_id, products]
  )
  const canSubmit = useMemo(() => {
    const hasText = Boolean(String(form.description || '').trim() || String(form.note || '').trim())
    const hasStatusChoice = !form.shouldChangeStatus || Boolean(selectedStatus)
    const hasInterestedProduct = !form.interest_enabled || Boolean(form.interest_product_id)
    return Boolean(leadId && hasText && hasStatusChoice && hasInterestedProduct)
  }, [form.description, form.interest_enabled, form.interest_product_id, form.note, form.shouldChangeStatus, leadId, selectedStatus])
  const isScheduleExpanded = Boolean(form.schedule_enabled)
  const isInterestExpanded = Boolean(form.interest_enabled)
  const sectionsLayoutClass = useMemo(() => {
    if (isScheduleExpanded && isInterestExpanded) {
      return 'xl:grid-cols-3'
    }

    if (isScheduleExpanded && !isInterestExpanded) {
      return 'xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(220px,0.6fr)]'
    }

    if (!isScheduleExpanded && isInterestExpanded) {
      return 'xl:grid-cols-[minmax(0,1.25fr)_minmax(220px,0.6fr)_minmax(0,1fr)]'
    }

    return 'xl:grid-cols-[minmax(0,1.8fr)_minmax(220px,0.55fr)_minmax(220px,0.55fr)]'
  }, [isInterestExpanded, isScheduleExpanded])

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
  }, [clearLongPressTimer])

  const stopResize = useCallback(() => {
    resizeStateRef.current = null
    setIsResizing(false)
  }, [])

  const stopInteractions = useCallback(() => {
    stopDrag()
    stopResize()
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }, [stopDrag, stopResize])

  const handlePointerMove = useCallback((event) => {
    const resizeState = resizeStateRef.current
    if (resizeState?.active) {
      setLayout({
        ...resizeState.startLayout,
        width: resizeState.startLayout.width + event.clientX - resizeState.startPointer.x,
        height: resizeState.startLayout.height + event.clientY - resizeState.startPointer.y,
      })
      return
    }

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

  const handleResizePointerDown = useCallback((event) => {
    if (event.button !== undefined && event.button !== 0) return

    event.preventDefault()
    event.stopPropagation()
    clearLongPressTimer()

    resizeStateRef.current = {
      active: true,
      startPointer: { x: event.clientX, y: event.clientY },
      startLayout: layoutRef.current || layout,
    }

    setIsResizing(true)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'nwse-resize'
  }, [clearLongPressTimer, layout])

  useEffect(() => {
    layoutRef.current = layout
  }, [layout])

  useEffect(() => {
    if (!open) return

    setForm({
      title: getFallbackTitle(customer, statuses, currentStatus),
      description: '',
      note: '',
      duration: '',
      result: '',
      shouldChangeStatus: false,
      new_status_id: '',
      schedule_enabled: false,
      schedule_type: 'none',
      schedule_title: '',
      schedule_description: '',
      schedule_mode: 'online',
      schedule_meeting_link: '',
      schedule_location: '',
      schedule_call_provider: 'manual',
      schedule_caller_number: '',
      schedule_callee_number: getCustomerPhone(customer),
      schedule_priority: 'high',
      schedule_start_at: formatDateTimeLocalInput(new Date()),
      schedule_end_at: formatDateTimeLocalInput(new Date(Date.now() + 60 * 60 * 1000)),
      schedule_reminder_type: 'both',
      schedule_reminder_before: '1',
      schedule_reminder_unit: 'minutes',
      activity_at: formatDateTimeLocalInput(new Date()),
      interest_enabled: false,
      interest_product_id: '',
      interest_level: 'high',
      interest_note: '',
    })
  }, [currentStatus, customer, open, statuses])

  useEffect(() => {
    if (!open) return undefined

    setLayout(layoutRef.current || getDefaultFloatingLayout())

    const handleResize = () => setLayout(layoutRef.current || getDefaultFloatingLayout())

    window.addEventListener('resize', handleResize)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopInteractions)
    window.addEventListener('pointercancel', stopInteractions)

    return () => {
      clearLongPressTimer()
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', stopInteractions)
      window.removeEventListener('pointercancel', stopInteractions)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [clearLongPressTimer, handlePointerMove, open, setLayout, stopInteractions])

  if (!open || typeof document === 'undefined') return null

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const description = String(form.description || '').trim()
    const note = String(form.note || '').trim()
    const title = String(form.title || '').trim() || oldStatusTitle || 'متابعة على العميل'
    const text = description || note

    if (!leadId) {
      toast.error('لا يوجد رقم Lead لهذا العميل')
      return
    }

    if (!text) {
      toast.error('اكتب الملاحظة أولا')
      return
    }

    if (form.shouldChangeStatus && !selectedStatus) {
      toast.error('اختر الحالة الجديدة أولا')
      return
    }

    if (form.schedule_enabled && form.schedule_type !== 'none' && (!form.schedule_start_at || !form.schedule_end_at)) {
      toast.error('اختر بداية ونهاية الموعد المرتبط')
      return
    }

    if (form.interest_enabled && !form.interest_product_id) {
      toast.error('اختر المنتج المهتم به العميل أولا')
      return
    }

    const payload = {
      lead_id: leadId,
      action: 'create_activity',
      type: 'note-to-lead',
      title,
      description: text,
      note: note || text,
      data: buildDataPayload(form),
      activity_at: formatDateTimeForApi(form.activity_at || formatDateTimeLocalInput(new Date())),
    }

    if (form.shouldChangeStatus && selectedStatus) {
      payload.new_status_id = selectedStatus.id
      payload.new_status_title = getStatusLabel(selectedStatus)
      payload.old_status_title = oldStatusTitle || ''
    }

    try {
      const savedActionResult = await mutations.saveAction.mutateAsync(payload)

      if (form.interest_enabled && form.interest_product_id) {
        await mutations.saveInterested.mutateAsync({
          lead_id: Number(leadId),
          interesteds: [
            {
              product_id: Number(form.interest_product_id),
              note: String(form.interest_note || '').trim(),
              interest_level: String(form.interest_level || 'high').trim(),
            },
          ],
        })
      }

      if (form.schedule_enabled && form.schedule_type !== 'none') {
        const savedActivityId = getSavedActivityId(savedActionResult)
        const baseScheduleTitle = String(form.schedule_title || form.title || '').trim()
        const effectiveScheduleTitle = baseScheduleTitle
          ? `${baseScheduleTitle}${savedActivityId ? ` (${savedActivityId})` : ''}`
          : `${form.schedule_type === 'call' ? 'مكالمة' : 'اجتماع'} متابعة${savedActivityId ? ` (${savedActivityId})` : ''}`

        await meetingMutations.create.mutateAsync({
          title: effectiveScheduleTitle,
          description: String(form.schedule_description || '').trim() || text,
          type: form.schedule_type,
          mode: form.schedule_mode,
          meeting_link: String(form.schedule_meeting_link || '').trim(),
          location: String(form.schedule_location || '').trim(),
          longitude: '',
          latitude: '',
          scope: 'participants',
          call_provider: form.schedule_type === 'call' ? form.schedule_call_provider : '',
          caller_number: form.schedule_type === 'call' ? String(form.schedule_caller_number || '').trim() : '',
          callee_number: form.schedule_type === 'call' ? String(form.schedule_callee_number || '').trim() : '',
          priority: form.schedule_priority,
          start_at: formatDateTimeForApi(form.schedule_start_at),
          end_at: formatDateTimeForApi(form.schedule_end_at),
          team_id: customer?.linked_by?.team_id || '',
          taskable_type: 'App\\Models\\Lead',
          taskable_id: leadId,
          users: [getAssignedUserId(customer)].filter(Boolean),
          reminder_type: form.schedule_reminder_type,
          reminder_before: form.schedule_reminder_before,
          reminder_unit: form.schedule_reminder_unit,
        })
      }

      toast.success(form.shouldChangeStatus ? 'تمت إضافة الملاحظة وتغيير الحالة' : 'تمت إضافة الملاحظة')
      onSaved?.({ payload, customer, savedActivityId: getSavedActivityId(savedActionResult) })
      onClose?.()
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'تعذر إضافة الملاحظة')
    }
  }

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[130000]">
      <div
        role="dialog"
        aria-modal="false"
        aria-label="إضافة متابعة"
        className="pointer-events-auto fixed max-h-[calc(100vh-24px)] overflow-hidden rounded-2xl border border-[#BEEFF2] bg-white shadow-2xl"
        dir="rtl"
        style={{
          left: 0,
          top: 0,
          width: layout.width,
          height: layout.height,
          transform: `translate3d(${layout.x}px, ${layout.y}px, 0)`,
        }}
      >
        <div
          className={cn(
            'flex cursor-grab touch-none select-none items-center justify-between gap-3 border-b border-[#E5F7F8] bg-[#F8FEFF] px-4 py-3 active:cursor-grabbing',
            isDragging && 'bg-[#E8F9FA]'
          )}
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

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 overflow-hidden p-4"
          style={{ height: Math.max(220, (Number(layout.height) || 760) - 74) }}
        >
          <div className={cn('grid min-h-0 flex-1 gap-4', sectionsLayoutClass)}>
            <div className="min-h-0 space-y-4 overflow-y-auto pe-1">
              <Input
                type="text"
                label="الحالة الخاصة بالمتابعة"
                value={form.title}
                onChange={(event) => updateForm('title', event.target.value)}
                placeholder={oldStatusTitle || 'متابعة على العميل'}
              />

              <label className="block">
                <span className="mb-1.5 block text-sm font-black text-[#111827]">نص الملاحظة</span>
                <textarea
                  value={form.description}
                  onChange={(event) => updateForm('description', event.target.value)}
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
                onChange={(event) => updateForm('note', event.target.value)}
                placeholder="اختياري"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  type="number"
                  min="0"
                  label="مدة المتابعة بالدقائق"
                  value={form.duration}
                  onChange={(event) => updateForm('duration', event.target.value)}
                  placeholder="15"
                />

                <label className="grid gap-1.5">
                  <span className="text-sm font-medium font-arabic text-[var(--text)]">نتيجة المتابعة</span>
                  <select
                    value={form.result}
                    onChange={(event) => updateForm('result', event.target.value)}
                    className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-arabic text-[var(--text)] outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-[#00C2CB]"
                  >
                    {RESULT_OPTIONS.map((option) => (
                      <option key={option.value || 'empty'} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <Input
                type="datetime-local"
                label="وقت المتابعة"
                value={form.activity_at}
                onChange={(event) => updateForm('activity_at', event.target.value)}
                startIcon={<CalendarClock size={16} />}
              />

              <div className="rounded-xl border border-[#D7EEF0] bg-[#F8FEFF] p-3">
                <label className="flex cursor-pointer items-center justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block text-sm font-black text-[#111827]">تريد تغيير الحالة؟</span>
                    <span className="mt-0.5 block text-xs font-bold text-[#64748B]">
                      عند الاختيار سيتم إرسال بيانات الحالة الجديدة مع الملاحظة.
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={form.shouldChangeStatus}
                    onChange={(event) => {
                      const checked = event.target.checked
                      setForm((current) => ({
                        ...current,
                        shouldChangeStatus: checked,
                        new_status_id: checked ? current.new_status_id : '',
                      }))
                    }}
                    className="h-5 w-5 rounded border-[#BEEFF2] text-[#00AEB8] focus:ring-[#00C2CB]"
                  />
                </label>

                {form.shouldChangeStatus ? (
                  <div className="mt-3 grid gap-2">
                    <label className="grid gap-1.5">
                      <span className="text-sm font-medium font-arabic text-[var(--text)]">الحالة الجديدة</span>
                      <div className="relative">
                        <select
                          value={form.new_status_id}
                          onChange={(event) => updateForm('new_status_id', event.target.value)}
                          className="h-10 w-full appearance-none rounded-lg border border-[var(--border)] bg-white px-3 pe-9 text-sm font-arabic text-[var(--text)] outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-[#00C2CB]"
                        >
                          <option value="">اختر الحالة</option>
                          {statuses.map((status) => (
                            <option key={status.id} value={status.id}>
                              {isStatusNoteRequired(status)
                                ? `${getStatusLabel(status)} (ملاحظة إجبارية)`
                                : getStatusLabel(status)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                      </div>
                    </label>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#64748B]">
                      <span className="rounded-full bg-white px-2 py-1 ring-1 ring-[#D7EEF0]">
                        الحالة الحالية: {oldStatusTitle || '-'}
                      </span>
                      {selectedStatus ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF3] px-2 py-1 text-[#166534] ring-1 ring-[#BBF7D0]">
                          <CheckCircle2 size={13} />
                          سيتم التغيير إلى: {getStatusLabel(selectedStatus)}
                          {isStatusNoteRequired(selectedStatus) ? ' (ملاحظة إجبارية)' : ''}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <FollowUpScheduleSection form={form} updateForm={updateForm} />

            <FollowUpInterestedProductSection
              form={form}
              updateForm={updateForm}
              products={products}
              isProductsLoading={productsQuery.isLoading}
              selectedProduct={selectedInterestedProduct}
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-[#EEF2F4] pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={mutations.saveAction.isPending || meetingMutations.create.isPending}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="accent"
              loading={mutations.saveAction.isPending || meetingMutations.create.isPending}
              disabled={!canSubmit}
            >
              حفظ المتابعة
            </Button>
          </div>
        </form>

        <button
          type="button"
          className={cn(
            'absolute bottom-2 right-2 h-4 w-4 rounded-sm border border-[#BEEFF2] bg-[#F8FEFF] text-transparent',
            isResizing ? 'cursor-nwse-resize bg-[#E8F9FA]' : 'cursor-nwse-resize'
          )}
          title="تغيير عرض وارتفاع النافذة"
          aria-label="تغيير عرض وارتفاع النافذة"
          onPointerDown={handleResizePointerDown}
        />
      </div>
    </div>,
    document.body
  )
}
