import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable } from '../../../shared/components/data-table'
import { Badge } from '../../../shared/components/ui/Badge'
import { Avatar } from '../../../shared/components/ui/Avatar'
import { useOpportunities } from '../../../features/opportunities/hooks/useOpportunities'
import { useOpportunityDrawerStore } from '../../../features/opportunities/store/opportunityDrawerStore'
import {
  getOpportunityTypes,
  getOpportunityStatuses,
  getOpportunityPriorities,
  getOpportunitySources,
} from '../../../features/opportunities/constants/opportunityTypes'
import {
  formatCurrency,
  formatDateTime,
  getOpportunityPriorityMeta,
  getOpportunitySourceMeta,
  getOpportunityStatusMeta,
  getOpportunityTypeLabel,
} from '../../../features/opportunities/utils/opportunityFormatters'

export function OpportunitiesTable() {
  const { t, i18n } = useTranslation()
  const opportunitiesQuery = useOpportunities()
  const openDrawer = useOpportunityDrawerStore((state) => state.open)
  const rows = opportunitiesQuery.data || []

  const typeOptions = useMemo(() => getOpportunityTypes(t).map((item) => ({ label: item.label, value: item.value })), [t])
  const statusOptions = useMemo(() => getOpportunityStatuses(t).map((item) => ({ label: item.label, value: item.value })), [t])
  const priorityOptions = useMemo(() => getOpportunityPriorities(t).map((item) => ({ label: item.label, value: item.value })), [t])
  const sourceOptions = useMemo(() => getOpportunitySources(t).map((item) => ({ label: item.label, value: item.value })), [t])

  const columns = useMemo(() => [
    {
      id: 'title',
      header: t('opportunities.columns.title'),
      accessor: 'title',
      searchable: true,
      sortable: true,
      width: 'w-56',
    },
    {
      id: 'customer',
      header: t('opportunities.columns.customer'),
      accessor: 'customer.name',
      searchable: true,
      sortable: true,
      width: 'w-48',
    },
    {
      id: 'type',
      header: t('opportunities.columns.type'),
      accessor: 'type',
      filterType: 'select',
      filterOptions: typeOptions,
      render: (row) => getOpportunityTypeLabel(row.type, t),
    },
    {
      id: 'product',
      header: t('opportunities.columns.product'),
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
      header: t('opportunities.columns.priority'),
      accessor: 'priority',
      filterType: 'select',
      filterOptions: priorityOptions,
      render: (row) => {
        const meta = getOpportunityPriorityMeta(row.priority, t)
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
      header: t('opportunities.columns.source'),
      accessor: 'source.type',
      filterType: 'select',
      filterOptions: sourceOptions,
      render: (row) => {
        const meta = getOpportunitySourceMeta(row.source?.type, t)
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
      header: t('opportunities.signals'),
      accessor: 'signals',
      sortable: false,
      searchable: false,
      render: (row) => (Array.isArray(row.signals) ? row.signals.length : 0),
    },
    {
      id: 'estimated_value',
      header: t('opportunities.estimatedValue'),
      accessor: 'estimated_value',
      sortable: true,
      filterType: 'number',
      render: (row) => (
        <span dir="ltr" className="font-latin">{formatCurrency(row.estimated_value, row.currency, i18n.language)}</span>
      ),
    },
    {
      id: 'owner',
      header: t('opportunities.columns.owner'),
      accessor: 'assigned_user.name',
      searchable: true,
      render: (row) => (
        row.assigned_user?.name ? (
          <span className="inline-flex items-center gap-2">
            <Avatar name={row.assigned_user.name} size="sm" />
            <span className="text-sm">{row.assigned_user.name}</span>
          </span>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">{t('opportunities.unassigned')}</span>
        )
      ),
    },
    {
      id: 'status',
      header: t('opportunities.columns.status'),
      accessor: 'status',
      filterType: 'select',
      filterOptions: statusOptions,
      render: (row) => {
        const meta = getOpportunityStatusMeta(row.status, t)
        return <Badge variant={meta.variant}>{meta.label}</Badge>
      },
    },
    {
      id: 'next_action',
      header: t('opportunities.columns.nextAction'),
      accessor: 'next_action.label',
      searchable: true,
      render: (row) => (
        row.next_action ? (
          <div className="text-xs">
            <p className="font-semibold text-[var(--text)]">{row.next_action.label}</p>
            <p className="text-[var(--text-muted)]" dir="ltr">{formatDateTime(row.next_action.due_at, i18n.language)}</p>
          </div>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">-</span>
        )
      ),
    },
    {
      id: 'detected_at',
      header: t('opportunities.columns.detectedAt'),
      accessor: 'detected_at',
      sortable: true,
      filterType: 'date',
      render: (row) => <span dir="ltr" className="text-xs">{formatDateTime(row.detected_at, i18n.language)}</span>,
    },
  ], [t, i18n.language, typeOptions, statusOptions, priorityOptions, sourceOptions])

  return (
    <DataTable
      data={rows}
      columns={columns}
      tableId="opportunities"
      isLoading={opportunitiesQuery.isLoading}
      error={opportunitiesQuery.error}
      onRetry={opportunitiesQuery.refetch}
      onRowDoubleClick={(row) => openDrawer(row.id)}
      emptyMessage={t('opportunities.noOpportunities')}
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
