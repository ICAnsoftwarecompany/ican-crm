import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { GripHorizontal, X, Zap } from 'lucide-react'
import { toast } from 'sonner'

import { useLeadInterestForm } from '../../../../features/leads'
import { useLeadMutations } from '../../../../features/leads/hooks/useLeads'
import { useMeetingMutations } from '../../../../features/meetings/hooks/useMeetings'
import { useLocalStorage } from '../../../../shared/components/data-table/hooks/useLocalStorage'
import { Button } from '../../../../shared/components/ui/Button'
import { cn } from '../../../../shared/utils/cn'
import { FollowUpScheduleSection } from './FollowUpScheduleSection'
import { FollowUpInterestedProductSection } from './FollowUpInterestedProductSection'
import { FollowUpMainFields, getStatusLabel } from './FollowUpMainFields'

const DRAG_LONG_PRESS_MS = 260

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

function getCustomerName(customer, t) {
  const lead = getLead(customer)
  return customer?.name || lead?.name || customer?.email || lead?.email || customer?.phone || lead?.phone || t('customers.table.theCustomer')
}

function getAssignedUserId(customer) {
  return customer?.linked_by?.id || customer?.lead?.assigned_to || customer?.agent_id || ''
}

function getCustomerPhone(customer) {
  const lead = getLead(customer)
  return lead?.phone || customer?.phone || ''
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

function getFallbackTitle(customer, statuses, currentStatus, t) {
  const status = resolveCurrentStatus(customer, statuses, currentStatus)
  return getStatusLabel(status) || t('customers.followUp.defaultTitle')
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
  const { t } = useTranslation()
  const mutations = useLeadMutations()
  const meetingMutations = useMeetingMutations()
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
  })

  const leadId = getLeadId(customer)
  // Quick follow-up (2026-10-15): follow-up, note, time and short note only; remembered in this browser.
  const [quickMode, setQuickMode] = useLocalStorage('customers-follow-up-quick', false)
  // Interest linked to the follow-up, on the new catalog; saved after the follow-up.
  const interestState = useLeadInterestForm({ open, leadIds: leadId ? [leadId] : [] })
  const withInterest = Boolean(form.interest_enabled) && !quickMode
  const withSchedule = Boolean(form.schedule_enabled) && !quickMode
  const customerName = getCustomerName(customer, t)
  const resolvedCurrentStatus = useMemo(
    () => resolveCurrentStatus(customer, statuses, currentStatus),
    [currentStatus, customer, statuses]
  )
  const oldStatusTitle = getStatusLabel(resolvedCurrentStatus)
  const selectedStatus = useMemo(
    () => statuses.find((status) => String(status?.id) === String(form.new_status_id)) || null,
    [form.new_status_id, statuses]
  )
  const canSubmit = useMemo(() => {
    const hasText = Boolean(String(form.description || '').trim() || String(form.note || '').trim())
    const hasStatusChoice = quickMode || !form.shouldChangeStatus || Boolean(selectedStatus)
    const hasInterestedProduct = !withInterest || Boolean(interestState.product)
    return Boolean(leadId && hasText && hasStatusChoice && hasInterestedProduct)
  }, [form.description, form.note, form.shouldChangeStatus, interestState.product, leadId, quickMode, selectedStatus, withInterest])
  const isScheduleExpanded = Boolean(form.schedule_enabled)
  const isInterestExpanded = Boolean(form.interest_enabled)
  const sectionsLayoutClass = useMemo(() => {
    if (quickMode) return 'grid-cols-1'

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
  }, [isInterestExpanded, isScheduleExpanded, quickMode])

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
      title: getFallbackTitle(customer, statuses, currentStatus, t),
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
    })
  }, [currentStatus, customer, open, statuses, t])

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
    const title = String(form.title || '').trim() || oldStatusTitle || t('customers.followUp.defaultTitle')
    const text = description || note

    if (!leadId) {
      toast.error(t('customers.followUp.errors.noLeadId'))
      return
    }

    if (!text) {
      toast.error(t('customers.followUp.errors.writeNoteFirst'))
      return
    }

    const changeStatus = form.shouldChangeStatus && !quickMode
    if (changeStatus && !selectedStatus) {
      toast.error(t('customers.followUp.errors.chooseNewStatusFirst'))
      return
    }

    if (withSchedule && form.schedule_type !== 'none' && (!form.schedule_start_at || !form.schedule_end_at)) {
      toast.error(t('customers.followUp.errors.chooseScheduleRange'))
      return
    }

    const interest = withInterest ? interestState.prepare() : null
    if (interest?.errors) {
      toast.error(t('customers.followUp.errors.chooseInterestedProductFirst'))
      return
    }

    const payload = {
      lead_id: leadId,
      action: 'create_activity',
      type: 'note-to-lead',
      title,
      description: text,
      note: note || text,
      data: quickMode ? {} : buildDataPayload(form),
      activity_at: formatDateTimeForApi(form.activity_at || formatDateTimeLocalInput(new Date())),
    }

    if (changeStatus && selectedStatus) {
      payload.new_status_id = selectedStatus.id
      payload.new_status_title = getStatusLabel(selectedStatus)
      payload.old_status_title = oldStatusTitle || ''
    }

    try {
      const savedActionResult = await mutations.saveAction.mutateAsync(payload)

      for (const interestPayload of interest?.payloads || []) {
        await mutations.saveInterested.mutateAsync(interestPayload)
      }

      if (withSchedule && form.schedule_type !== 'none') {
        const savedActivityId = getSavedActivityId(savedActionResult)
        const baseScheduleTitle = String(form.schedule_title || form.title || '').trim()
        const scheduleFollowUpLabel = form.schedule_type === 'call'
          ? t('customers.followUp.scheduleCallFollowUp')
          : t('customers.followUp.scheduleMeetingFollowUp')
        const effectiveScheduleTitle = baseScheduleTitle
          ? `${baseScheduleTitle}${savedActivityId ? ` (${savedActivityId})` : ''}`
          : `${scheduleFollowUpLabel}${savedActivityId ? ` (${savedActivityId})` : ''}`

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

      toast.success(changeStatus ? t('customers.followUp.toasts.noteAndStatusAdded') : t('customers.followUp.toasts.noteAdded'))
      onSaved?.({ payload, customer, savedActivityId: getSavedActivityId(savedActionResult) })
      onClose?.()
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || t('customers.followUp.toasts.noteAddFailed'))
    }
  }

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[130000]">
      <div
        role="dialog"
        aria-modal="false"
        aria-label={t('customers.followUp.addFollowUp')}
        className="pointer-events-auto fixed max-h-[calc(100vh-24px)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        style={{
          left: 0,
          top: 0,
          // Quick follow-up: narrower and as tall as its four fields (2026-10-15).
          width: quickMode ? Math.min(layout.width, 640) : layout.width,
          height: quickMode ? 'auto' : layout.height,
          transform: `translate3d(${layout.x}px, ${layout.y}px, 0)`,
        }}
      >
        <div
          className={cn(
            'flex cursor-grab touch-none select-none items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 active:cursor-grabbing',
            isDragging && 'opacity-90'
          )}
          title={t('customers.followUp.pressHoldToMove')}
          onPointerDown={handleHeaderPointerDown}
        >
          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-[var(--text)]">{t('customers.followUp.addFollowUp')}</h3>
            <p className="mt-0.5 truncate text-xs font-bold text-[var(--text-muted)]">{customerName}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <label
              className="me-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-bold text-[var(--text)]"
              title={t('customers.followUp.quickModeHint')}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={Boolean(quickMode)}
                onChange={(event) => setQuickMode(event.target.checked)}
                className="h-4 w-4 accent-[#00C2CB]"
              />
              <Zap size={14} className="text-[#00A3AA]" aria-hidden="true" />
              {t('customers.followUp.quickMode')}
            </label>
            <GripHorizontal size={17} className="text-[var(--text-muted)]" />
            <button
              type="button"
              onClick={onClose}
              onPointerDown={(event) => event.stopPropagation()}
              disabled={mutations.saveAction.isPending}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] disabled:opacity-60"
              aria-label={t('customers.table.activityTimeline.close')}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 overflow-hidden p-4"
          style={quickMode ? undefined : { height: Math.max(220, (Number(layout.height) || 760) - 74) }}
        >
          <div className={cn('grid min-h-0 flex-1 gap-4', sectionsLayoutClass)}>
            <FollowUpMainFields
              form={form}
              setForm={setForm}
              updateForm={updateForm}
              statuses={statuses}
              selectedStatus={selectedStatus}
              oldStatusTitle={oldStatusTitle}
              quick={Boolean(quickMode)}
            />

            {!quickMode && <FollowUpScheduleSection form={form} updateForm={updateForm} />}

            {!quickMode && (
              <FollowUpInterestedProductSection
                enabled={Boolean(form.interest_enabled)}
                onToggle={(checked) => updateForm('interest_enabled', checked)}
                interestState={interestState}
              />
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={mutations.saveAction.isPending || meetingMutations.create.isPending || mutations.saveInterested.isPending}
            >
              {t('customers.table.cancel')}
            </Button>
            <Button
              type="submit"
              variant="accent"
              loading={mutations.saveAction.isPending || meetingMutations.create.isPending || mutations.saveInterested.isPending}
              disabled={!canSubmit}
            >
              {t('customers.followUp.saveFollowUp')}
            </Button>
          </div>
        </form>

        {!quickMode && <button
          type="button"
          className={cn(
            'absolute bottom-2 right-2 h-4 w-4 rounded-sm border border-[#BEEFF2] bg-[#F8FEFF] text-transparent',
            isResizing ? 'cursor-nwse-resize bg-[#E8F9FA]' : 'cursor-nwse-resize'
          )}
          title={t('customers.table.activityTimeline.resizeWindow')}
          aria-label={t('customers.table.activityTimeline.resizeWindow')}
          onPointerDown={handleResizePointerDown}
        />}
      </div>
    </div>,
    document.body
  )
}
