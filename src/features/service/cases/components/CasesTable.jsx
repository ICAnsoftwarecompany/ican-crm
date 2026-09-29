import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DataTable } from '../../../../shared/components/data-table'
import { formatRelativeTime } from '../../../../shared/utils/dateTime'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useServiceTerminology } from '../../core/capabilities/useServiceCapabilities'
import { CasePriorityBadge, CaseStatusBadge } from './CaseBadges'
import { CaseTypeIcon } from './CaseTypeIcon'

/**
 * Case list on the shared DataTable. Server-side view/search; rows are
 * appended page by page (cursor mode) as the user scrolls.
 */
export function CasesTable({ query, emptyMessage }) {
  const { t, i18n } = useTranslation()
  const term = useServiceTerminology()
  const navigate = useNavigate()
  const language = i18n.language

  const rows = useMemo(
    () =>
      query.cases.map((item) => ({
        ...item,
        type_label: localizeLabel(item.type?.label, language),
        status_label: localizeLabel(item.status?.label, language),
        queue_label: localizeLabel(item.queue?.label, language, '-'),
        assignee_name: item.assignee?.name || '',
        customer_name: item.customer?.name || '',
      })),
    [query.cases, language]
  )

  const columns = useMemo(
    () => [
      {
        id: 'case_number',
        header: t('service.cases.fields.number'),
        accessor: 'case_number',
        width: 150,
        render: (row) => <span dir="ltr" className="font-mono text-xs text-[var(--text-muted)]">{row.case_number}</span>,
      },
      {
        id: 'subject',
        header: t('service.cases.fields.subject'),
        accessor: 'subject',
        width: 280,
        render: (row) => (
          <span className="flex items-center gap-2">
            <CaseTypeIcon icon={row.type?.icon} className="shrink-0 text-[var(--text-muted)]" />
            <span className="truncate font-medium text-[var(--text)]">{row.subject}</span>
          </span>
        ),
      },
      { id: 'customer', header: term('customer'), accessor: 'customer_name', filterType: 'text' },
      { id: 'type', header: t('service.cases.fields.type'), accessor: 'type_label', filterType: 'select' },
      {
        id: 'status',
        header: t('service.cases.fields.status'),
        accessor: 'status_label',
        filterType: 'select',
        render: (row) => <CaseStatusBadge status={row.status} />,
      },
      {
        id: 'priority',
        header: t('service.cases.fields.priority'),
        accessor: 'priority',
        filterType: 'select',
        render: (row) => <CasePriorityBadge priority={row.priority} />,
      },
      { id: 'queue', header: t('service.cases.fields.queue'), accessor: 'queue_label', filterType: 'select' },
      {
        id: 'assignee',
        header: t('service.cases.fields.assignee'),
        accessor: 'assignee_name',
        render: (row) => row.assignee_name || <span className="text-[var(--text-muted)]">{t('service.cases.unassigned')}</span>,
      },
      {
        id: 'updated_at',
        header: t('service.cases.fields.updated'),
        accessor: 'updated_at',
        sortable: true,
        render: (row) => <span className="text-xs text-[var(--text-muted)]">{formatRelativeTime(row.updated_at, language)}</span>,
      },
    ],
    [t, term, language]
  )

  return (
    <DataTable
      data={rows}
      columns={columns}
      tableId="service-cases"
      isLoading={query.isLoading}
      error={query.error}
      onRetry={query.refetch}
      emptyMessage={emptyMessage}
      onRowClick={(row) => navigate(`/service/cases/${row.id}`)}
      hasNextPage={Boolean(query.hasNextPage)}
      isFetchingNextPage={query.isFetchingNextPage}
      onLoadMore={() => query.fetchNextPage()}
      enableSorting
      enableFiltering
      enableColumnVisibility
      enableExport
      showToolbar
      showFooter
    />
  )
}
