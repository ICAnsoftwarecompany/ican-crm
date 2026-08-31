import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Pin, PinOff, Plus, RefreshCw, Tag } from 'lucide-react'
import { toast } from 'sonner'

import { definitionsApi } from '../../../features/definitions/api/definitionsApi'
import { useLeadMutations } from '../../../features/leads/hooks/useLeads'
import { Button } from '../../../shared/components/ui/Button'
import { extractMessage } from '../../../shared/utils/apiResponse'
import { cn } from '../../../shared/utils/cn'
import { extractLeadStatuses } from '../utils/customerStatus'
import { CustomerSocialMessagingPanel, SOCIAL_MESSAGE_CHANNELS } from './CustomerSocialMessagingPanel'

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

export function CustomersBulkActions({
  selectedRows = [],
  selectedCount = 0,
  clearSelection,
  onDone,
  onAddLeadNote,
}) {
  const [statusId, setStatusId] = useState('')
  const [tagId, setTagId] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [activeMessageChannelId, setActiveMessageChannelId] = useState('messenger')
  const [isMessageBoxOpen, setIsMessageBoxOpen] = useState(false)
  const mutations = useLeadMutations()

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
  const canAddLeadNote = selectedCount === 1 && selectedRows.length === 1
  const pinShortcutLabel = 'Ctrl + P'

  useEffect(() => {
    if (!selectedCount) return undefined

    const handlePinShortcut = (event) => {
      if (!(event.ctrlKey || event.metaKey)) return
      if (!(event.code === 'KeyP' || event.key?.toLowerCase() === 'p')) return

      event.preventDefault()
      setIsPinned((value) => !value)
    }

    document.addEventListener('keydown', handlePinShortcut)

    return () => {
      document.removeEventListener('keydown', handlePinShortcut)
    }
  }, [selectedCount])

  const finishAction = (message) => {
    toast.success(message)
    clearSelection?.()
    onDone?.()
  }

  const handleChangeStatus = async () => {
    if (!hasSelection || !selectedStatus) return

    try {
      await Promise.all(selectedRows.map((row) => {
        const leadId = getLeadId(row)
        if (!leadId) return Promise.resolve()

        return mutations.saveAction.mutateAsync({
          lead_id: leadId,
          action: 'create_activity',
          type: 'status_change',
          title: `تغيير الحالة إلى ${selectedStatus.status}`,
          description: `تم تغيير حالة العميل إلى ${selectedStatus.status}`,
          note: '',
          data: {
            source: 'customers_bulk_actions',
          },
          new_status_id: selectedStatus.id,
          new_status_title: selectedStatus.status,
          old_status_title: getCurrentStatusTitle(row, statusById),
          activity_at: formatDateTimeForApi(new Date().toISOString().slice(0, 16)),
        })
      }))

      setStatusId('')
      finishAction(`تم تغيير حالة ${leadIds.length} عميل`)
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر تغيير حالات العملاء المحددين'))
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
      finishAction(`تم تغيير تاج ${leadIds.length} عميل`)
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر تغيير تاج العملاء المحددين'))
    }
  }

  const handleOpenMessageBox = (channelId) => {
    if (!hasSelection) {
      toast.info('اختر عميلًا واحدًا على الأقل لفتح بوكس الرسالة.')
      return
    }

    setActiveMessageChannelId(channelId)
    setIsMessageBoxOpen(true)
  }

  const handleCloseMessageBox = () => {
    setIsMessageBoxOpen(false)
  }

  const handleAddLeadNote = () => {
    if (!canAddLeadNote) return
    onAddLeadNote?.(selectedRows[0])
  }

  if (!selectedCount) return null

  return (
    <>
      {isPinned && <div className="h-16 rounded-xl border border-dashed border-[#BEEFF2] bg-[#F8FEFF]/60" />}

    <div
      className={cn(
        'flex min-w-[min(720px,100%)] flex-col gap-2 rounded-xl border border-[#BEEFF2] bg-[#F8FEFF] p-2 shadow-sm xl:flex-row xl:items-center',
        isPinned && 'fixed inset-x-4 top-3 z-[95] max-h-[calc(100vh-1.5rem)] overflow-auto shadow-2xl backdrop-blur'
      )}
    >
      <div className="flex shrink-0 items-center gap-2">
        <div className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#007A80]">
          المحدد: {selectedCount}
        </div>
        <Button
          size="icon"
          variant={isPinned ? 'primary' : 'outline'}
          onClick={() => setIsPinned((value) => !value)}
          title={`${isPinned ? 'إلغاء تثبيت إجراءات العملاء' : 'تثبيت إجراءات العملاء أعلى الصفحة'} (${pinShortcutLabel})`}
          aria-label={`${isPinned ? 'إلغاء تثبيت إجراءات العملاء' : 'تثبيت إجراءات العملاء أعلى الصفحة'} (${pinShortcutLabel})`}
        >
          {isPinned ? <PinOff size={15} /> : <Pin size={15} />}
        </Button>
      </div>

      <div className="grid min-w-0 flex-1 gap-2 md:grid-cols-2">
        <div className="flex min-w-0 gap-1">
          <select
            value={statusId}
            onChange={(event) => setStatusId(event.target.value)}
            className="h-9 min-w-0 flex-1 rounded-lg border border-[#D7EEF0] bg-white px-2 text-xs font-bold text-[var(--text)]"
          >
            <option value="">اختر حالة</option>
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.status || status.name}
              </option>
            ))}
          </select>
          <Button
            size="icon"
            variant="ai"
            onClick={handleChangeStatus}
            disabled={!hasSelection || !selectedStatus}
            loading={mutations.saveAction.isPending}
            title="تغيير حالة العملاء المحددين"
          >
            <RefreshCw size={15} />
          </Button>
        </div>

        <div className="flex min-w-0 gap-1">
          <select
            value={tagId}
            onChange={(event) => setTagId(event.target.value)}
            className="h-9 min-w-0 flex-1 rounded-lg border border-[#D7EEF0] bg-white px-2 text-xs font-bold text-[var(--text)]"
          >
            <option value="">اختر تاج</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {getTagLabel(tag)}
              </option>
            ))}
          </select>
          <Button
            size="icon"
            variant="ai"
            onClick={handleChangeTag}
            disabled={!hasSelection || !selectedTag}
            loading={mutations.updateTag.isPending}
            title="تغيير تاج العملاء المحددين"
          >
            <Tag size={15} />
          </Button>
        </div>

      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button
          variant="ai"
          size="sm"
          onClick={handleAddLeadNote}
          disabled={!canAddLeadNote}
          title={
            canAddLeadNote
              ? 'إضافة متابعة على العميل المحدد'
              : 'إضافة متابعة متاحة عند اختيار عميل واحد فقط'
          }
          className="whitespace-nowrap"
        >
          <Plus size={14} />
          إضافة متابعة
        </Button>
      </div>

      <div className="rounded-xl border border-[#D7EEF0] bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">

          <div className="rounded-full bg-[#F8FEFF] px-3 py-1 text-xs font-bold text-[#007A80]">
            {`محدد: ${selectedCount}`}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {SOCIAL_MESSAGE_CHANNELS.map((channel) => {
            const isDisabled = !hasSelection

            return (
              <button
                key={channel.id}
                type="button"
                onClick={() => handleOpenMessageBox(channel.id)}
                disabled={isDisabled}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                  'border-[#D7EEF0] bg-white text-[var(--text)] hover:bg-[#F8FEFF]'
                )}
                title={isDisabled ? 'اختر عميلًا واحدًا على الأقل لفتح بوكس الرسالة' : `كتابة رسالة ${channel.label}`}
                aria-label={isDisabled ? 'اختر عميلًا واحدًا على الأقل لفتح بوكس الرسالة' : `كتابة رسالة ${channel.label}`}
              >
                <span
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-black text-white"
                  style={{ backgroundColor: channel.accent }}
                >
                  {channel.shortLabel || channel.label.slice(0, 2)}
                </span>
                <span>{channel.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <CustomerSocialMessagingPanel
        customers={selectedRows}
        channelId={activeMessageChannelId}
        isOpen={isMessageBoxOpen && hasSelection}
        onClose={handleCloseMessageBox}
      />
    </div>
    </>
  )
}
