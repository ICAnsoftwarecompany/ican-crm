import { useMemo } from 'react'
import { DataTable } from '../../../shared/components/data-table'
import { Badge } from '../../../shared/components/ui/Badge'
import { Avatar } from '../../../shared/components/ui/Avatar'
import { useOpportunities } from '../../../features/opportunities/hooks/useOpportunities'
import { useOpportunityDrawerStore } from '../../../features/opportunities/store/opportunityDrawerStore'
import {
  OPPORTUNITY_TYPES,
  OPPORTUNITY_STATUSES,
  OPPORTUNITY_PRIORITIES,
  OPPORTUNITY_SOURCES,
} from '../../../features/opportunities/constants/opportunityTypes'
import {
  formatCurrency,
  formatDateTime,
  getOpportunityPriorityMeta,
  getOpportunitySourceMeta,
  getOpportunityStatusMeta,
  getOpportunityTypeLabel,
} from '../../../features/opportunities/utils/opportunityFormatters'

const TYPE_OPTIONS = OPPORTUNITY_TYPES.map((item) => ({ label: item.label, value: item.value }))
const STATUS_OPTIONS = OPPORTUNITY_STATUSES.map((item) => ({ label: item.label, value: item.value }))
const PRIORITY_OPTIONS = OPPORTUNITY_PRIORITIES.map((item) => ({ label: item.label, value: item.value }))
const SOURCE_OPTIONS = OPPORTUNITY_SOURCES.map((item) => ({ label: item.label, value: item.value }))

export function OpportunitiesTable() {
  const opportunitiesQuery = useOpportunities()
  const openDrawer = useOpportunityDrawerStore((state) => state.open)
  const rows = opportunitiesQuery.data || []

  const columns = useMemo(() => [
    {
      id: 'title',
      header: 'الفرصة',
      accessor: 'title',
      searchable: true,
      sortable: true,
      width: 'w-56',
    },
    {
      id: 'customer',
      header: 'العميل',
      accessor: 'customer.name',
      searchable: true,
      sortable: true,
      width: 'w-48',
    },
    {
      id: 'type',
      header: 'النوع',
      accessor: 'type',
      filterType: 'select',
      filterOptions: TYPE_OPTIONS,
      render: (row) => getOpportunityTypeLabel(row.type),
    },
    {
      id: 'product',
      header: 'المنتج',
      accessor: 'product.name',
      searchable: true,
    },
    {
      id: 'score',
      header: 'Score',
      accessor: 'score.total',
      sortable: true,
      filterType: 'number',
      render: (row) => (
        <span className="inline-flex items-center justify-center h-7 min-w-7 px-1.5 rounded-full bg-[#00C2CB] text-white text-xs font-black font-latin">
          {row.score?.total ?? '-'}
        </span>
      ),
    },
    {
      id: 'priority',
      header: 'الأولوية',
      accessor: 'priority',
      filterType: 'select',
      filterOptions: PRIORITY_OPTIONS,
      render: (row) => {
        const meta = getOpportunityPriorityMeta(row.priority)
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: meta.color }}>
            <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
            {meta.label}
          </span>
        )
      },
    },
    {
      id: 'source',
      header: 'المصدر',
      accessor: 'source.type',
      filterType: 'select',
      filterOptions: SOURCE_OPTIONS,
      render: (row) => {
        const meta = getOpportunitySourceMeta(row.source?.type)
        const Icon = meta.icon
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
            {Icon ? <Icon size={14} style={{ color: meta.color }} /> : null}
            {meta.label}
          </span>
        )
      },
    },
    {
      id: 'signals',
      header: 'الإشارات',
      accessor: 'signals',
      sortable: false,
      searchable: false,
      render: (row) => (Array.isArray(row.signals) ? row.signals.length : 0),
    },
    {
      id: 'estimated_value',
      header: 'القيمة المحتملة',
      accessor: 'estimated_value',
      sortable: true,
      filterType: 'number',
      render: (row) => (
        <span dir="ltr" className="font-latin">{formatCurrency(row.estimated_value, row.currency)}</span>
      ),
    },
    {
      id: 'owner',
      header: 'المسؤول',
      accessor: 'assigned_user.name',
      searchable: true,
      render: (row) => (
        row.assigned_user?.name ? (
          <span className="inline-flex items-center gap-2">
            <Avatar name={row.assigned_user.name} size="sm" />
            <span className="text-sm">{row.assigned_user.name}</span>
          </span>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">غير مسند</span>
        )
      ),
    },
    {
      id: 'status',
      header: 'الحالة',
      accessor: 'status',
      filterType: 'select',
      filterOptions: STATUS_OPTIONS,
      render: (row) => {
        const meta = getOpportunityStatusMeta(row.status)
        return <Badge variant={meta.variant}>{meta.label}</Badge>
      },
    },
    {
      id: 'next_action',
      header: 'الإجراء القادم',
      accessor: 'next_action.label',
      searchable: true,
      render: (row) => (
        row.next_action ? (
          <div className="text-xs">
            <p className="font-semibold text-[var(--text)]">{row.next_action.label}</p>
            <p className="text-[var(--text-muted)]" dir="ltr">{formatDateTime(row.next_action.due_at)}</p>
          </div>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">-</span>
        )
      ),
    },
    {
      id: 'detected_at',
      header: 'تاريخ الاكتشاف',
      accessor: 'detected_at',
      sortable: true,
      filterType: 'date',
      render: (row) => <span dir="ltr" className="text-xs">{formatDateTime(row.detected_at)}</span>,
    },
  ], [])

  return (
    <DataTable
      data={rows}
      columns={columns}
      tableId="opportunities"
      isLoading={opportunitiesQuery.isLoading}
      error={opportunitiesQuery.error}
      onRetry={opportunitiesQuery.refetch}
      onRowDoubleClick={(row) => openDrawer(row.id)}
      emptyMessage="لا توجد فرص بيعية"
      enableSorting
      enableFiltering
      enableAdvancedFilters
      enablePagination
      enableColumnVisibility
      enableExport
      showToolbar
      showFooter
    />
  )
}
