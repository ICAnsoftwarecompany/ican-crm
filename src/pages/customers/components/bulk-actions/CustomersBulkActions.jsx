import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { definitionsApi } from '../../../../features/definitions/api/definitionsApi'
import { useLeadMutations } from '../../../../features/leads/hooks/useLeads'
import { useMeetingMutations } from '../../../../features/meetings/hooks/useMeetings'
import { useLocalStorage } from '../../../../shared/components/data-table/hooks/useLocalStorage'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { cn } from '../../../../shared/utils/cn'
import {
  CUSTOMERS_BULK_ACTIONS_PIN_MODE_EVENT,
  CUSTOMERS_SIDEBAR_BULK_ACTIONS_SLOT_ID,
} from '../../layout/CustomersSidebar'
import { extractLeadStatuses } from '../../utils/customerStatus'
import { CustomerSocialMessagingPanel } from './social-messaging'
import { PinBulkActionsButton } from './PinBulkActionsButton'
import { SelectedCountBadge } from './SelectedCountBadge'
import {
  AddFollowUpBulkAction,
  ChangeStatusBulkAction,
  ChangeTagBulkAction,
  SocialMessagingBulkActions,
  StatusChangeReasonDialog,
} from './selection-actions'

const PIN_MODE_STORAGE_KEY = 'customers-bulk-actions-pin-mode'

function collectObjects(value, matcher) {
  if (!value) return []
  if (Array.isArray(value)) return value.flatMap((item) => collectObjects(item, matcher))
  if (typeof value !== 'object') return []
  if (matcher(value)) return [value]

  return Object.values(value).flatMap((item) => collectObjects(item, matcher))
}

function extractTags(response) {
  return collectObjects(response?.data ?? response, (item) => (
    'id' in item && ('tag' in item || 'name' in item || 'status' in item)
  )).filter((tag) => Number(tag.active ?? 1) === 1)
}

function getTagLabel(tag) {
  return tag?.tag || tag?.name || tag?.status || ''
}

function getLead(row) {
  return row?.lead || {}
}

function getLeadId(row) {
  return getLead(row).id ?? row?.lead_id ?? row?.id
}

function uniqueIds(rows = []) {
  return Array.from(new Set(
    rows
      .map(getLeadId)
      .filter((id) => id !== null && id !== undefined && id !== '')
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id))
  ))
}

function formatDateTimeForApi(value) {
  if (!value) return ''
  return value.replace('T', ' ')
}

function getCurrentStatusTitle(row, statusById) {
  const statusId = getLead(row).status_type_id ?? row?.status_type_id
  const status = statusById.get(String(statusId))
  return status?.status || status?.name || ''
}

function requiresReason(status) {
  return Number(status?.has_resone) === 1
}

function getLeadScheduleContext(row) {
  const lead = getLead(row)
  return {
    id: lead?.id ?? row?.lead_id ?? row?.id,
    name: lead?.name || row?.name || '',
    phone: lead?.phone || row?.phone || '',
    lead,
    linked_by: row?.linked_by || lead?.linked_by,
    agent_id: row?.agent_id,
  }
}

function useSidebarBulkActionsSlot(enabled) {
  const [slot, setSlot] = useState(null)

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') {
      setSlot(null)
      return undefined
    }

    let frameId = null

    const updateSlot = () => {
      setSlot(document.getElementById(CUSTOMERS_SIDEBAR_BULK_ACTIONS_SLOT_ID))
    }

    updateSlot()
    frameId = window.requestAnimationFrame(updateSlot)

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      setSlot(null)
    }
  }, [enabled])

  return slot
}

export function CustomersBulkActions({
  selectedRows = [],
  selectedCount = 0,
  clearSelection,
  onDone,
  onAddLeadNote,
}) {
  const [statusId, setStatusId] = useState('')
  const [tagId, setTagId] = useState('')
  const [pinMode, setPinMode] = useLocalStorage(PIN_MODE_STORAGE_KEY, 'none')
  const [activeMessageChannelId, setActiveMessageChannelId] = useState('messenger')
  const [isMessageBoxOpen, setIsMessageBoxOpen] = useState(false)
  const [isReasonDialogOpen, setIsReasonDialogOpen] = useState(false)
  const [reasonStatus, setReasonStatus] = useState(null)
  const mutations = useLeadMutations()
  const meetingMutations = useMeetingMutations()
  const activePinMode = selectedCount ? pinMode : 'none'
  const isHorizontalPinned = activePinMode === 'horizontal'
  const isVerticalPinned = activePinMode === 'vertical'
  const sidebarSlot = useSidebarBulkActionsSlot(isVerticalPinned)

  const statusesQuery = useQuery({
    queryKey: ['customers', 'bulk-actions', 'statuses'],
    queryFn: () => definitionsApi.getStatuses(),
    select: extractLeadStatuses,
    staleTime: 1000 * 60,
  })

  const tagsQuery = useQuery({
    queryKey: ['customers', 'bulk-actions', 'tags'],
    queryFn: () => definitionsApi.getTags(),
    select: extractTags,
    staleTime: 1000 * 60,
  })

  const statuses = statusesQuery.data || []
  const tags = tagsQuery.data || []
  const statusById = useMemo(() => new Map(statuses.map((status) => [String(status.id), status])), [statuses])
  const leadIds = useMemo(() => uniqueIds(selectedRows), [selectedRows])
  const selectedStatus = statuses.find((status) => String(status.id) === String(statusId))
  const selectedTag = tags.find((tag) => String(tag.id) === String(tagId))
  const hasSelection = leadIds.length > 0
  const isSingleLeadSelection = leadIds.length === 1 && selectedRows.length === 1
  const canAddLeadNote = selectedCount === 1 && selectedRows.length === 1
  const singleLeadContext = isSingleLeadSelection ? getLeadScheduleContext(selectedRows[0]) : null

  const statusOptions = useMemo(() => statuses.map((status) => {
    const blockedForMultiple = requiresReason(status) && !isSingleLeadSelection

    return {
      ...status,
      disabled: blockedForMultiple,
      disabledReason: blockedForMultiple
        ? 'هذه الحالة تتطلب سببًا ولا يمكن اختيارها مع أكثر من ليد'
        : '',
    }
  }), [isSingleLeadSelection, statuses])

  useEffect(() => {
    if (!selectedStatus) return

    const blocked = requiresReason(selectedStatus) && !isSingleLeadSelection
    if (blocked) {
      setStatusId('')
    }
  }, [isSingleLeadSelection, selectedStatus])

  useEffect(() => {
    if (!selectedCount) return undefined

    const handlePinShortcut = (event) => {
      if (!(event.ctrlKey || event.metaKey)) return
      if (!(event.code === 'KeyP' || event.key?.toLowerCase() === 'p')) return

      event.preventDefault()
      setPinMode((value) => (value === 'horizontal' ? 'none' : 'horizontal'))
    }

    document.addEventListener('keydown', handlePinShortcut)

    return () => {
      document.removeEventListener('keydown', handlePinShortcut)
    }
  }, [selectedCount, setPinMode])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    window.dispatchEvent(new CustomEvent(CUSTOMERS_BULK_ACTIONS_PIN_MODE_EVENT, {
      detail: { pinMode: activePinMode },
    }))

    return () => {
      window.dispatchEvent(new CustomEvent(CUSTOMERS_BULK_ACTIONS_PIN_MODE_EVENT, {
        detail: { pinMode: 'none' },
      }))
    }
  }, [activePinMode])

  const finishAction = (message) => {
    toast.success(message)
    clearSelection?.()
    onDone?.()
  }

  const buildActivityAt = () => formatDateTimeForApi(new Date().toISOString().slice(0, 16))

  const applyStatusToSelectedRows = async ({ reasonText = '' } = {}) => {
    if (!selectedStatus) return

    await Promise.all(selectedRows.map((row) => {
      const leadId = getLeadId(row)
      if (!leadId) return Promise.resolve()

      const nextStatusTitle = selectedStatus.status || selectedStatus.name || ''
      const oldStatusTitle = getCurrentStatusTitle(row, statusById)
      const requiresReasonForStatus = requiresReason(selectedStatus)

      return mutations.saveAction.mutateAsync({
        lead_id: leadId,
        action: 'create_activity',
        type: requiresReasonForStatus ? 'note-to-lead' : 'status_change',
        title: requiresReasonForStatus ? `سبب تغيير الحالة إلى ${nextStatusTitle}` : `تغيير الحالة إلى ${nextStatusTitle}`,
        description: requiresReasonForStatus
          ? reasonText
          : `تم تغيير حالة العميل المحتمل إلى ${nextStatusTitle}`,
        note: requiresReasonForStatus ? reasonText : '',
        data: {
          source: 'customers_bulk_actions',
        },
        new_status_id: selectedStatus.id,
        new_status_title: nextStatusTitle,
        old_status_title: oldStatusTitle,
        activity_at: buildActivityAt(),
      })
    }))
  }

  const handleChangeStatus = async () => {
    if (!hasSelection || !selectedStatus) return

    if (requiresReason(selectedStatus) && !isSingleLeadSelection) {
      toast.info('هذه الحالة تتطلب سببًا، لذلك يمكن اختيارها مع ليد واحد فقط.')
      return
    }

    if (requiresReason(selectedStatus) && isSingleLeadSelection) {
      setReasonStatus(selectedStatus)
      setIsReasonDialogOpen(true)
      return
    }

    try {
      await applyStatusToSelectedRows()

      setStatusId('')
      finishAction(`تم تغيير حالة ${leadIds.length} عميل محتمل`)
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر تغيير حالات العملاء المحتملين المحددين'))
    }
  }

  const handleSubmitReason = async ({ reason, schedulePayload }) => {
    if (!reasonStatus) return

    try {
      await applyStatusToSelectedRows({ reasonText: reason })

      if (schedulePayload?.type) {
        await meetingMutations.create.mutateAsync({
          ...schedulePayload,
          title: schedulePayload.title || `${schedulePayload.type === 'call' ? 'مكالمة' : 'اجتماع'} متابعة الحالة`,
          description: schedulePayload.description || reason,
        })
      }

      setStatusId('')
      setIsReasonDialogOpen(false)
      setReasonStatus(null)
      finishAction('تم تغيير الحالة مع حفظ السبب')
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر تغيير الحالة مع السبب'))
    }
  }

  const handleChangeTag = async () => {
    if (!hasSelection || !selectedTag) return

    try {
      await mutations.updateTag.mutateAsync({
        ids: leadIds,
        tag_id: Number(selectedTag.id),
      })

      setTagId('')
      finishAction(`تم تغيير تاج ${leadIds.length} عميل محتمل`)
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر تغيير تاج العملاء المحتملين المحددين'))
    }
  }

  const handleOpenMessageBox = (channelId) => {
    if (!hasSelection) {
      toast.info('اختر عميلا محتملا واحدا على الأقل لفتح صندوق الرسالة.')
      return
    }

    setActiveMessageChannelId(channelId)
    setIsMessageBoxOpen(true)
  }

  const handleAddLeadNote = () => {
    if (!canAddLeadNote) return
    onAddLeadNote?.(selectedRows[0])
  }

  if (!selectedCount) return null

  const bar = (
    <>
      <div
        className={cn(
          'flex rounded-xl border border-[#BEEFF2] bg-[#F8FEFF] p-2 shadow-sm',
          isVerticalPinned
            ? 'w-full min-w-0 flex-col gap-2'
            : 'min-w-[min(720px,100%)] flex-col gap-2 xl:flex-row xl:items-center',
          isHorizontalPinned && 'fixed inset-x-4 top-3 z-[95] max-h-[calc(100vh-1.5rem)] overflow-auto shadow-2xl backdrop-blur'
        )}
      >
        <div className={cn('flex shrink-0 items-center gap-2', isVerticalPinned && 'justify-between')}>
          <SelectedCountBadge selectedCount={selectedCount} />
          <PinBulkActionsButton pinMode={activePinMode} onPinModeChange={setPinMode} />
        </div>

        <div className={cn('grid min-w-0 flex-1 gap-2', !isVerticalPinned && 'md:grid-cols-2')}>
          <ChangeStatusBulkAction
            value={statusId}
            statuses={statusOptions}
            onChange={setStatusId}
            onSubmit={handleChangeStatus}
            selectDisabled={!hasSelection}
            disabled={!hasSelection || !selectedStatus}
            loading={mutations.saveAction.isPending}
          />

          <ChangeTagBulkAction
            value={tagId}
            tags={tags}
            getTagLabel={getTagLabel}
            onChange={setTagId}
            onSubmit={handleChangeTag}
            disabled={!hasSelection || !selectedTag}
            loading={mutations.updateTag.isPending}
          />
        </div>

        <div className={cn('flex shrink-0 flex-wrap items-center gap-2', isVerticalPinned && '[&>button]:w-full')}>
          <AddFollowUpBulkAction disabled={!canAddLeadNote} onClick={handleAddLeadNote} />
        </div>

        <SocialMessagingBulkActions
          selectedCount={selectedCount}
          disabled={!hasSelection}
          onOpenChannel={handleOpenMessageBox}
          compact={isVerticalPinned}
        />

        <CustomerSocialMessagingPanel
          customers={selectedRows}
          channelId={activeMessageChannelId}
          isOpen={isMessageBoxOpen && hasSelection}
          onClose={() => setIsMessageBoxOpen(false)}
        />

        <StatusChangeReasonDialog
          open={isReasonDialogOpen}
          loading={mutations.saveAction.isPending || meetingMutations.create.isPending}
          status={reasonStatus}
          lead={singleLeadContext}
          onClose={() => {
            setIsReasonDialogOpen(false)
            setReasonStatus(null)
          }}
          onSubmit={handleSubmitReason}
        />
      </div>
    </>
  )

  if (isVerticalPinned && sidebarSlot) {
    return createPortal(bar, sidebarSlot)
  }

  if (isVerticalPinned) {
    return null
  }

  return (
    <>
      {isHorizontalPinned && <div className="h-16 rounded-xl border border-dashed border-[#BEEFF2] bg-[#F8FEFF]/60" />}
      {bar}
    </>
  )
}
