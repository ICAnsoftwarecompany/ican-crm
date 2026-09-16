import { useMemo } from 'react'

import { DataTable } from '../../../../shared/components/data-table'
import { buildActivityColumns } from './activityColumns.jsx'

export function ActivityTable({
  activities,
  isLoading,
  error,
  onRetry,
  onRowClick,
  customerDataLookup,
  rowClassName,
  rowContextActions,
  nowTimestamp,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onView,
  onEdit,
  onStart,
  onFinish,
  onCancel,
  onDelete,
  onFollowUp,
  onOpenRelated,
}) {
  const columns = useMemo(() => buildActivityColumns({
    onView,
    onEdit,
    onStart,
    onFinish,
    onCancel,
    onDelete,
    onFollowUp,
    onOpenRelated,
    customerDataLookup,
    nowTimestamp,
  }), [customerDataLookup, nowTimestamp, onCancel, onDelete, onEdit, onFinish, onFollowUp, onOpenRelated, onStart, onView])

  return (
    <DataTable
      tableId="activities-management"
      data={activities}
      columns={columns}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      onRowClick={onRowClick}
      rowClassName={rowClassName}
      rowContextActions={rowContextActions}
      hasNextPage={hasMore}
      isFetchingNextPage={isLoadingMore}
      onLoadMore={onLoadMore}
      emptyMessage="لا توجد مكالمات أو اجتماعات مطابقة."
      sortFirstDirection="desc"
      enableGlobalSearch
      enableAdvancedFilters
    />
  )
}
