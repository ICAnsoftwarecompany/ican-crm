import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Columns3, Search, X } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '../../../../shared/components/feedback/EmptyState'
import { Skeleton } from '../../../../shared/components/feedback/Skeleton'
import { PipelineBoard } from '../../../../shared/components/pipeline-board'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { PIPELINE_ITEM_ID_FIELD, PIPELINE_STAGE_FIELD, UNSTAGED_PIPELINE_STAGE_ID } from '../constants'
import {
  buildPipelineStages,
  filterCustomersBySearch,
  getPipelineLead,
  getPipelineLeadId,
  hasCustomerChannel,
  toPipelineItems,
} from '../utils/customerPipeline'
import { CustomerPipelineCard } from './CustomerPipelineCard'

function BoardSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(4,minmax(260px,1fr))] gap-4 overflow-hidden">
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
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
      <div className="w-full sm:w-72">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('customers.pipeline.searchPlaceholder')}
          aria-label={t('customers.pipeline.searchPlaceholder')}
          startIcon={<Search size={15} />}
          className="h-9"
        />
      </div>
      <span className="text-xs font-semibold text-[var(--text-muted)]">
        {t('customers.pipeline.shownCount', { count: visibleCount })}
      </span>
      {selectedRows.length > 0 && (
        <Button variant="ghost" size="sm" onClick={clearSelection} className="gap-1">
          <X size={14} />
          {t('customers.pipeline.clearSelection', { count: selectedRows.length })}
        </Button>
      )}
      <div className="ms-auto flex min-w-0 flex-wrap items-center gap-2">
        {renderToolbarActions?.({ selectedRows, selectedCount: selectedRows.length, clearSelection })}
      </div>
    </div>
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
    </div>
  )
}
