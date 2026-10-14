import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Columns3 } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '../../../../shared/components/feedback/EmptyState'
import { Skeleton } from '../../../../shared/components/feedback/Skeleton'
import { PipelineBoard } from '../../../../shared/components/pipeline-board'
import { Button } from '../../../../shared/components/ui/Button'
import { useUsers } from '../../../users/hooks/useUsers'
import { PIPELINE_ITEM_ID_FIELD, PIPELINE_STAGE_FIELD, UNSTAGED_PIPELINE_STAGE_ID } from '../constants'
import {
  buildPipelineStages,
  filterCustomersBySearch,
  getPipelineLead,
  getPipelineLeadId,
  hasCustomerChannel,
  toPipelineItems,
} from '../utils/customerPipeline'
import { usePipelineCardFields } from '../hooks/usePipelineCardFields'
import { CustomerPipelineCard } from './CustomerPipelineCard'
import { CustomersPipelineToolbar } from './CustomersPipelineToolbar'
import { PipelineCardSettingsDrawer } from './PipelineCardSettingsDrawer'

const COLUMN_WIDTH = 272
// Each column scrolls on its own so the board's horizontal scrollbar stays in view.
const COLUMN_BODY_CLASS = 'max-h-[calc(100vh-15rem)] min-h-24 overflow-y-auto overscroll-contain pe-0.5'

function getUserLabel(user) {
  return user?.name || user?.username || user?.email || ''
}

function BoardSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(4,272px)] gap-3 overflow-hidden">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="space-y-2 rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  )
}

function buildChannelPayload(customer, conversationId) {
  const lead = getPipelineLead(customer)
  return {
    conversationId,
    leadId: getPipelineLeadId(customer) || '',
    customerId: customer?.customer_id || customer?.id || '',
    leadName: lead.name || customer?.name || '',
    phone: lead.phone || customer?.phone || '',
    email: lead.email || customer?.email || '',
  }
}

/**
 * Leads Center pipeline view: one column per lead status, drag a card to change its status.
 * Data, filters and actions come from the page so the table and pipeline stay in sync.
 */
export function CustomersPipelineView({
  rows = [],
  statuses = [],
  selectedStatusId = null,
  isLoading = false,
  error = null,
  onRetry,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  activeCustomerKey = '',
  latestLeadNotes,
  resolveMessengerChannel,
  resolveGmailChannel,
  actions = {},
  onStatusDrop,
  renderToolbarActions,
  emptyAction,
}) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [selectedKeys, setSelectedKeys] = useState(() => new Set())
  const [settingsOpen, setSettingsOpen] = useState(false)
  const cardFields = usePipelineCardFields()
  const usersQuery = useUsers()
  const userById = useMemo(
    () => new Map((Array.isArray(usersQuery.data) ? usersQuery.data : []).map((user) => [String(user.id), user])),
    [usersQuery.data]
  )

  const items = useMemo(() => toPipelineItems(filterCustomersBySearch(rows, search), statuses), [rows, search, statuses])
  const stages = useMemo(
    () => buildPipelineStages(statuses, items, { unstagedLabel: t('customers.pipeline.unstaged'), selectedStatusId }),
    [items, selectedStatusId, statuses, t]
  )
  const visibleCount = useMemo(() => {
    const stageIds = new Set(stages.map((stage) => stage.id))
    return items.filter((item) => stageIds.has(item[PIPELINE_STAGE_FIELD])).length
  }, [items, stages])
  const itemByKey = useMemo(() => new Map(items.map((item) => [item[PIPELINE_ITEM_ID_FIELD], item])), [items])
  const selectedRows = useMemo(
    () => Array.from(selectedKeys).map((key) => itemByKey.get(key)).filter(Boolean),
    [itemByKey, selectedKeys]
  )

  const toggleSelect = useCallback((customer) => {
    const key = customer[PIPELINE_ITEM_ID_FIELD]
    setSelectedKeys((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])
  const clearSelection = useCallback(() => setSelectedKeys(new Set()), [])

  const handleItemMove = (itemId, _fromStageId, toStageId) => {
    if (toStageId === UNSTAGED_PIPELINE_STAGE_ID) {
      toast.info(t('customers.pipeline.toasts.cannotUnstage'))
      return undefined
    }
    const customer = itemByKey.get(String(itemId))
    const stage = stages.find((entry) => entry.id === String(toStageId))
    if (!customer || !stage?.status) return undefined
    return onStatusDrop?.({ customer, status: stage.status })
  }

  const getChannels = (customer) => {
    const messenger = hasCustomerChannel(customer, 'messenger') ? resolveMessengerChannel?.(customer) || {} : null
    const gmail = hasCustomerChannel(customer, 'gmail') ? resolveGmailChannel?.(customer) || {} : null
    return {
      messenger: messenger && { enabled: true, unreadCount: Number(messenger.unreadCount || 0), conversationId: messenger.conversationId || '' },
      gmail: gmail && { enabled: true, unreadCount: Number(gmail.unreadCount || 0), conversationId: gmail.conversationId || '' },
    }
  }

  const renderCard = (customer) => {
    const lead = getPipelineLead(customer)
    const channels = getChannels(customer)
    const note = latestLeadNotes?.get?.(String(getPipelineLeadId(customer) ?? ''))?.note || ''
    return (
      <CustomerPipelineCard
        customer={customer}
        visibleFieldIds={cardFields.visibleFieldIds}
        assigneeLabel={getUserLabel(userById.get(String(lead.assigned_to ?? '')))}
        selected={selectedKeys.has(customer[PIPELINE_ITEM_ID_FIELD])}
        highlighted={Boolean(activeCustomerKey) && activeCustomerKey === customer[PIPELINE_ITEM_ID_FIELD]}
        tagLabel={lead.tag?.tag || lead.tag?.name || ''}
        latestNote={note}
        channels={channels}
        onToggleSelect={toggleSelect}
        actions={{
          ...actions,
          onOpenMessenger: (row) => actions.onOpenMessenger?.(buildChannelPayload(row, channels.messenger?.conversationId || '')),
          onOpenGmail: (row) => actions.onOpenGmail?.(buildChannelPayload(row, channels.gmail?.conversationId || '')),
        }}
      />
    )
  }

  const toolbar = (
    <CustomersPipelineToolbar
      search={search}
      onSearchChange={setSearch}
      visibleCount={visibleCount}
      selectedCount={selectedRows.length}
      onClearSelection={clearSelection}
      onOpenSettings={() => setSettingsOpen(true)}
    >
      {renderToolbarActions?.({ selectedRows, selectedCount: selectedRows.length, clearSelection })}
    </CustomersPipelineToolbar>
  )

  let content
  if (isLoading) {
    content = <BoardSkeleton />
  } else if (error) {
    content = (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
        <p className="text-sm font-semibold text-[#DC2626]">{t('customers.pipeline.loadError')}</p>
        {onRetry && <Button variant="outline" size="sm" className="mt-3" onClick={() => onRetry()}>{t('customers.pipeline.retry')}</Button>}
      </div>
    )
  } else if (!stages.length) {
    content = (
      <EmptyState
        icon={<Columns3 size={22} />}
        title={t('customers.pipeline.noStatusesTitle')}
        description={t('customers.pipeline.noStatusesDescription')}
        action={emptyAction}
      />
    )
  } else {
    content = (
      <PipelineBoard
        stages={stages}
        items={items}
        itemStageKey={PIPELINE_STAGE_FIELD}
        itemIdKey={PIPELINE_ITEM_ID_FIELD}
        renderCard={renderCard}
        renderEmpty={() => (
          <div className="rounded-md border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--text-muted)]">
            {t('customers.pipeline.emptyColumn')}
          </div>
        )}
        onItemMove={handleItemMove}
        dragMode="longPress"
        columnWidth={COLUMN_WIDTH}
        columnBodyClassName={COLUMN_BODY_CLASS}
      />
    )
  }

  return (
    <div className="min-w-0 space-y-3">
      {toolbar}
      {content}
      {!isLoading && !error && hasNextPage && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => onLoadMore?.()} loading={isFetchingNextPage}>
            {t('customers.pipeline.loadMore')}
          </Button>
        </div>
      )}
      <PipelineCardSettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        fields={cardFields.fields}
        onToggle={cardFields.toggleField}
        onMove={cardFields.moveField}
        onReset={cardFields.resetFields}
      />
    </div>
  )
}
