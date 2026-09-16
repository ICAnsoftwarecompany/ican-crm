import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import { useLeadMutations } from '../../../../../features/leads/hooks/useLeads'
import { useMeetingMutations } from '../../../../../features/meetings/hooks/useMeetings'
import { extractMessage } from '../../../../../shared/utils/apiResponse'
import { cn } from '../../../../../shared/utils/cn'
import { StatusChangeReasonDialog } from '../../bulk-actions/selection-actions/status/StatusChangeReasonDialog'
import { formatDateTimeForApi } from '../customerDetailsUtils'
import { QuickActionButton } from './QuickActionButton'

function getLeadId(customer) {
  return customer?.lead_id || customer?.lead?.id
}

function getStatusLabel(status) {
  return status?.status || status?.name || ''
}

function requiresReason(status) {
  return Number(status?.has_resone ?? status?.has_reason ?? status?.requires_reason ?? 0) === 1
}

function getLeadScheduleContext(customer) {
  const lead = customer?.lead || {}
  return {
    id: lead?.id ?? customer?.lead_id ?? customer?.id,
    name: lead?.name || customer?.name || '',
    phone: lead?.phone || customer?.phone || '',
    lead,
    linked_by: customer?.linked_by || lead?.linked_by,
    agent_id: customer?.agent_id,
  }
}

function getMenuPosition(anchor) {
  if (!anchor) return { top: 0, left: 0, width: 220 }

  const rect = anchor.getBoundingClientRect()
  const width = 240
  const left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.left))
  const top = Math.min(window.innerHeight - 260, rect.bottom + 8)

  return {
    top: Math.max(8, top),
    left,
    width,
  }
}

export function StatusQuickAction({ customer, statuses = [], currentStatus, onChanged }) {
  const [open, setOpen] = useState(false)
  const [isReasonDialogOpen, setIsReasonDialogOpen] = useState(false)
  const [reasonStatus, setReasonStatus] = useState(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 240 })
  const buttonWrapRef = useRef(null)
  const menuRef = useRef(null)
  const mutations = useLeadMutations()
  const meetingMutations = useMeetingMutations()
  const leadId = getLeadId(customer)
  const currentStatusId = currentStatus?.id ?? customer?.lead?.status_type_id ?? customer?.status_type_id
  const canOpen = Boolean(leadId && statuses.length)

  useEffect(() => {
    if (!open) return undefined

    const syncPosition = () => setMenuPosition(getMenuPosition(buttonWrapRef.current))
    const closeOnOutside = (event) => {
      if (buttonWrapRef.current?.contains(event.target)) return
      if (menuRef.current?.contains(event.target)) return
      setOpen(false)
    }

    syncPosition()
    document.addEventListener('pointerdown', closeOnOutside, true)
    window.addEventListener('resize', syncPosition)
    window.addEventListener('scroll', syncPosition, true)

    return () => {
      document.removeEventListener('pointerdown', closeOnOutside, true)
      window.removeEventListener('resize', syncPosition)
      window.removeEventListener('scroll', syncPosition, true)
    }
  }, [open])

  const changeStatus = async (status, { reasonText = '' } = {}) => {
    if (!leadId || !status) return

    const statusRequiresReason = requiresReason(status)
    const statusLabel = getStatusLabel(status)

    await mutations.saveAction.mutateAsync({
      lead_id: leadId,
      action: 'create_activity',
      type: statusRequiresReason ? 'note-to-lead' : 'status_change',
      title: statusRequiresReason ? `سبب تغيير الحالة إلى ${statusLabel}` : `تغيير الحالة إلى ${statusLabel}`,
      description: statusRequiresReason ? reasonText : `تم تغيير حالة العميل إلى ${statusLabel}`,
      note: statusRequiresReason ? reasonText : '',
      data: {
        source: 'customer_details_quick_actions',
      },
      new_status_id: status.id,
      new_status_title: statusLabel,
      old_status_title: getStatusLabel(currentStatus),
      activity_at: formatDateTimeForApi(new Date()),
    })

    toast.success('تم تغيير حالة العميل')
    setOpen(false)
    onChanged?.({
      customer,
      actionType: 'status',
      newStatus: status,
      oldStatus: currentStatus,
    })
  }

  const handleSelectStatus = async (status) => {
    if (!leadId || !status) return

    if (requiresReason(status)) {
      setReasonStatus(status)
      setOpen(false)
      setIsReasonDialogOpen(true)
      return
    }

    try {
      await changeStatus(status)
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر تغيير حالة العميل'))
    }
  }

  const handleSubmitReason = async ({ reason, schedulePayload }) => {
    if (!reasonStatus) return

    try {
      await changeStatus(reasonStatus, { reasonText: reason })

      if (schedulePayload?.type) {
        await meetingMutations.create.mutateAsync({
          ...schedulePayload,
          title: schedulePayload.title || `${schedulePayload.type === 'call' ? 'مكالمة' : 'اجتماع'} متابعة الحالة`,
          description: schedulePayload.description || reason,
        })
      }

      setIsReasonDialogOpen(false)
      setReasonStatus(null)
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر تغيير الحالة مع حفظ السبب'))
    }
  }

  return (
    <span ref={buttonWrapRef} className="inline-flex">
      <QuickActionButton
        icon={RefreshCw}
        label="تغيير الحالة"
        accentClassName="text-[#64748B]"
        onClick={() => {
          if (!canOpen || mutations.saveAction.isPending) return
          setMenuPosition(getMenuPosition(buttonWrapRef.current))
          setOpen((value) => !value)
        }}
        alert={false}
        alertTitle={canOpen ? 'تغيير حالة العميل' : 'لا توجد حالات متاحة لهذا العميل'}
      />

      {open && typeof document !== 'undefined' ? createPortal(
        <div
          ref={menuRef}
          className="fixed z-[130000] max-h-72 overflow-y-auto rounded-xl border border-[#BEEFF2] bg-white p-2 shadow-2xl"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            width: `${menuPosition.width}px`,
          }}
        >
          <div className="mb-1 px-2 py-1 text-[11px] font-black text-[var(--text-muted)]">
            اختر حالة جديدة
          </div>
          <div className="space-y-1">
            {statuses.map((status) => {
              const selected = String(status.id) === String(currentStatusId)
              const label = getStatusLabel(status)
              const reasonRequired = requiresReason(status)

              return (
                <button
                  key={status.id}
                  type="button"
                  onClick={() => handleSelectStatus(status)}
                  disabled={mutations.saveAction.isPending || selected}
                  className={cn(
                    'flex w-full min-w-0 items-center gap-2 rounded-lg px-2 py-2 text-start text-xs font-bold transition-colors',
                    selected
                      ? 'bg-[#E8F9FA] text-[#007A80]'
                      : 'text-[var(--text)] hover:bg-[#F8FEFF]',
                    mutations.saveAction.isPending && 'cursor-wait opacity-70'
                  )}
                  title={`تغيير حالة العميل إلى: ${label}${reasonRequired ? ' - تتطلب سبب' : ''}`}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full border border-[#E2E8F0]"
                    style={{ backgroundColor: status.color || '#94A3B8' }}
                  />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  {reasonRequired ? (
                    <span className="shrink-0 rounded-full bg-[#FEF3C7] px-1.5 py-0.5 text-[10px] font-black text-[#92400E]">
                      سبب
                    </span>
                  ) : null}
                  {selected ? <Check size={14} className="shrink-0" /> : null}
                </button>
              )
            })}
          </div>
        </div>,
        document.body
      ) : null}

      <StatusChangeReasonDialog
        open={isReasonDialogOpen}
        loading={mutations.saveAction.isPending || meetingMutations.create.isPending}
        status={reasonStatus}
        lead={getLeadScheduleContext(customer)}
        onClose={() => {
          setIsReasonDialogOpen(false)
          setReasonStatus(null)
        }}
        onSubmit={handleSubmitReason}
      />
    </span>
  )
}
