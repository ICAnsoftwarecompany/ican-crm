import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DataTable } from '../../../../shared/components/data-table'
import { formatMoney, progressPercent } from '../../utils/dealMoney'
import { DealStatusBadge } from '../common/DealStatusBadge'
import { ProgressBar } from '../common/ProgressBar'
import { useQuickInfoLabels } from './DealQuickInfo'

/**
 * Every deal of the tenant as a table (rows from DealsHubList, with quick info: products, team, last action).
 * Click a row to open the deal's workspace.
 */
export function DealsTable({ deals, infos, query }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const labels = useQuickInfoLabels()

  // Quick info as plain columns, so it sorts, filters and exports like the rest.
  const rows = useMemo(() => deals.map((deal) => {
    const info = infos.get(String(deal.id))
    return {
      ...deal,
      productsLabel: labels.products(info),
      productsCount: info?.productsCount ?? null,
      teamLabel: labels.team(info),
      teamCount: info?.teamCount ?? null,
      lastActionLabel: labels.lastAction(info),
      lastActionAt: info?.lastAction?.at || '',
    }
  }), [deals, infos, labels])

  const columns = useMemo(() => [
    { id: 'name', header: t('dealWorkspace.fields.name'), accessor: 'name', filterType: 'text', render: (row) => <span className="font-semibold text-[var(--text)]">{row.name}</span> },
    {
      id: 'status', header: t('dealWorkspace.fields.status'), accessor: 'statusValue', filterType: 'select',
      filterOptions: ['draft', 'active', 'paused', 'completed', 'cancelled'].map((value) => ({ value, label: t(`dealWorkspace.options.dealStatus.${value}`) })),
      render: (row) => <DealStatusBadge status={row.status} />,
    },
    { id: 'type', header: t('dealWorkspace.fields.type'), accessor: 'type', render: (row) => (row.type ? t(`dealWorkspace.options.dealType.${row.type}`, row.type) : '—') },
    { id: 'owner', header: t('dealWorkspace.fields.owner'), accessor: 'owner.name', render: (row) => row.owner?.name || row.owner_name || '—' },
    {
      id: 'leads', header: t('dealWorkspace.fields.leads'), accessor: 'leadsCount',
      render: (row) => <div className="min-w-[120px]"><ProgressBar value={progressPercent(row.leadsCount, row.target_leads)} label={<span dir="ltr">{row.leadsCount} / {row.target_leads ?? '—'}</span>} /></div>,
    },
    { id: 'revenue', header: t('dealWorkspace.fields.revenue'), accessor: 'target_revenue', filterType: 'number', render: (row) => (row.target_revenue == null ? '—' : <span dir="ltr">{formatMoney(row.target_revenue, i18n.language)}</span>) },
    { id: 'products', header: t('dealWorkspace.quickInfo.products'), accessor: 'productsLabel', filterType: 'text', render: (row) => <span className={row.productsCount === 0 ? 'text-amber-700 dark:text-amber-300' : ''}>{row.productsLabel}</span> },
    { id: 'team', header: t('dealWorkspace.quickInfo.team'), accessor: 'teamLabel', filterType: 'text', render: (row) => <span className={row.teamCount === 0 ? 'text-amber-700 dark:text-amber-300' : ''}>{row.teamLabel}</span> },
    { id: 'lastAction', header: t('dealWorkspace.quickInfo.lastAction'), accessor: 'lastActionLabel', render: (row) => <span className="text-xs text-[var(--text-muted)]">{row.lastActionLabel}</span> },
    { id: 'dates', header: t('dealWorkspace.fields.period'), accessor: 'start_date', filterType: 'date', render: (row) => <span dir="ltr">{String(row.start_date || '—').slice(0, 10)} → {String(row.end_date || '—').slice(0, 10)}</span> },
  ], [i18n.language, t])

  return (
    <DataTable
      data={rows}
      columns={columns}
      tableId="deals-workspace"
      isLoading={query.isLoading}
      error={query.error}
      onRetry={query.refetch}
      onRowClick={(row) => navigate(`/deals/${row.id}`)}
      emptyMessage={t('dealWorkspace.empty')}
      enableSorting
      enableFiltering
      enableGlobalSearch
      enablePagination
      enableColumnVisibility
      enableExport
      showToolbar
      showFooter
    />
  )
}
