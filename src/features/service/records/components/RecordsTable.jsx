import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DataTable } from '../../../../shared/components/data-table'
import { formatDate, formatRelativeTime } from '../../../../shared/utils/dateTime'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useServiceTerminology } from '../../core/capabilities/useServiceCapabilities'
import { CaseStatusBadge } from '../../cases/components/CaseBadges'
import { RecordFlags } from './RecordFlags'

/** Records of one type on the shared DataTable (cursor mode). */
export function RecordsTable({ query, recordType, detailPath, emptyMessage }) {
  const { t, i18n } = useTranslation()
  const term = useServiceTerminology()
  const navigate = useNavigate()
  const language = i18n.language
  const date = (value) => (value ? formatDate(value, language, { dateStyle: 'medium' }) : '—')

  const rows = useMemo(
    () =>
      query.records.map((record) => ({
        ...record,
        customer_name: record.customer?.name || '',
        status_label: localizeLabel(record.status?.label, language, record.status?.key),
        batch_label: record.batch ? localizeLabel(record.batch.name, language, record.batch.reference_no) : '',
        assignee_name: record.assigned_user?.name || '',
        participants_count: record.counts?.participants ?? 0,
        attention_count: (record.counts?.documents_missing || 0) + (record.counts?.components_pending || 0),
      })),
    [query.records, language]
  )

  const columns = useMemo(
    () => [
      { id: 'reference_no', header: t('service.records.fields.reference'), accessor: 'reference_no', width: 150, render: (row) => <span dir="ltr" className="font-mono text-xs text-[var(--text-muted)]">{row.reference_no}</span> },
      { id: 'customer', header: term('customer'), accessor: 'customer_name', filterType: 'text', render: (row) => <span className="font-medium text-[var(--text)]">{row.customer_name}</span> },
      { id: 'status', header: t('service.records.fields.status'), accessor: 'status_label', filterType: 'select', render: (row) => <CaseStatusBadge status={row.status} /> },
      ...(recordType?.batch_enabled
        ? [{ id: 'batch', header: localizeLabel(recordType.batch_label, language, t('service.records.fields.batch')), accessor: 'batch_label', filterType: 'select' }]
        : []),
      { id: 'starts_at', header: t('service.records.fields.startsAt'), accessor: 'starts_at', sortable: true, render: (row) => <span className="text-xs">{date(row.starts_at || row.expected_at)}</span> },
      { id: 'participants', header: t('service.records.fields.participants'), accessor: 'participants_count', width: 110, render: (row) => <span dir="ltr" className="text-xs">{row.counts?.participants ?? 0}</span> },
      { id: 'flags', header: t('service.records.fields.attention'), accessor: 'attention_count', width: 120, render: (row) => <RecordFlags counts={row.counts} /> },
      { id: 'assignee', header: t('service.records.fields.assignee'), accessor: 'assignee_name', render: (row) => row.assignee_name || <span className="text-[var(--text-muted)]">{t('service.cases.unassigned')}</span> },
      { id: 'updated_at', header: t('service.cases.fields.updated'), accessor: 'updated_at', sortable: true, render: (row) => <span className="text-xs text-[var(--text-muted)]">{formatRelativeTime(row.updated_at, language)}</span> },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, term, language, recordType]
  )

  return (
    <DataTable
      data={rows}
      columns={columns}
      tableId={`service-records-${recordType?.key || 'all'}`}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={query.refetch}
      emptyMessage={emptyMessage}
      onRowClick={(row) => navigate(detailPath(row))}
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
