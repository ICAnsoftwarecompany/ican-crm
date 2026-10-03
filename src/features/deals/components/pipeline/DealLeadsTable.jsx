import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { UserCheck } from 'lucide-react'
import { DataTable } from '../../../../shared/components/data-table'
import { Button } from '../../../../shared/components/ui/Button'
import { formatDate } from '../../../../shared/utils/dateTime'
import { formatMoney } from '../../utils/dealMoney'
import { LeadStatusBadge } from '../common/DealStatusBadge'

/** Table view of the deal's leads (shared DataTable). Select rows → assign them to one owner. */
export function DealLeadsTable({ dealId, leads, stages, stageMap, ownerNames, isLoading, error, onRetry, actions }) {
  const { t, i18n } = useTranslation()

  const columns = useMemo(() => [
    { id: 'name', header: t('dealWorkspace.fields.name'), accessor: 'name', filterType: 'text' },
    { id: 'phone', header: t('dealWorkspace.fields.phone'), accessor: 'phone', filterType: 'text', render: (row) => <span dir="ltr">{row.phone || '—'}</span> },
    {
      id: 'stage', header: t('dealWorkspace.fields.stage'), accessor: 'stage_id', filterType: 'select',
      filterOptions: stages.map((stage) => ({ value: stage.id, label: stage.label })),
      render: (row) => {
        const stage = stageMap.get(String(row.stage_id))
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage?.color || 'var(--text-muted)' }} />
            {stage?.label || '—'}
          </span>
        )
      },
    },
    {
      id: 'status', header: t('dealWorkspace.fields.leadStatus'), accessor: 'status', filterType: 'select',
      filterOptions: ['open', 'won', 'lost'].map((value) => ({ value, label: t(`dealWorkspace.options.leadStatus.${value}`) })),
      render: (row) => <LeadStatusBadge status={row.status} />,
    },
    { id: 'owner', header: t('dealWorkspace.fields.owner'), accessor: 'ownerId', render: (row) => ownerNames.get(String(row.ownerId)) || row.ownerName || t('dealWorkspace.leads.unassigned') },
    { id: 'value', header: t('dealWorkspace.fields.estimatedValue'), accessor: 'estimatedValue', filterType: 'number', render: (row) => <span dir="ltr">{formatMoney(row.estimatedValue, i18n.language)}</span> },
    { id: 'source', header: t('dealWorkspace.fields.source'), accessor: 'source', filterType: 'text', render: (row) => (row.source ? t(`dealWorkspace.sources.${row.source}`, row.source) : '—') },
    { id: 'lastActivity', header: t('dealWorkspace.fields.lastActivity'), accessor: 'lastActivityAt', filterType: 'date', render: (row) => (row.lastActivityAt ? formatDate(row.lastActivityAt, i18n.language) : '—') },
  ], [i18n.language, ownerNames, stageMap, stages, t])

  return (
    <DataTable
      data={leads}
      columns={columns}
      tableId={`deal-${dealId}-leads`}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      onRowClick={(row) => actions.onOpen(row)}
      emptyMessage={t('dealWorkspace.pipeline.emptyTable')}
      toolbarActions={({ selectedRows, clearSelection }) => (selectedRows.length ? (
        <Button size="sm" variant="outline" onClick={() => actions.onAssign(selectedRows, clearSelection)}>
          <UserCheck size={14} />{t('dealWorkspace.leads.assignSelected', { count: selectedRows.length })}
        </Button>
      ) : null)}
      enableSorting
      enableFiltering
      enableGlobalSearch={false}
      enableColumnVisibility
      enableExport
      showToolbar
      showFooter
    />
  )
}
