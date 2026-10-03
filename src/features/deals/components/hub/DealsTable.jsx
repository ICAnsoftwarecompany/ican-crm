import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Handshake, Plus } from 'lucide-react'
import { DataTable } from '../../../../shared/components/data-table'
import { ModulePageHeader } from '../../../../shared/components/module-pages'
import { Button } from '../../../../shared/components/ui/Button'
import { useDeals } from '../../hooks/useDeals'
import { getDealStatusValue } from '../../utils/dealDisplay'
import { formatMoney, progressPercent } from '../../utils/dealMoney'
import { DealStatusBadge } from '../common/DealStatusBadge'
import { ProgressBar } from '../common/ProgressBar'

/** Every deal of the tenant; each one is a workspace with its own data. Click a row to open it. */
export function DealsTable() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const query = useDeals()

  const rows = useMemo(() => query.deals.map((deal) => ({
    ...deal,
    statusValue: getDealStatusValue(deal.status),
    leadsCount: Number(deal.leads_count ?? deal.deal_leads_count ?? 0),
  })), [query.deals])

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
    { id: 'dates', header: t('dealWorkspace.fields.period'), accessor: 'start_date', filterType: 'date', render: (row) => <span dir="ltr">{String(row.start_date || '—').slice(0, 10)} → {String(row.end_date || '—').slice(0, 10)}</span> },
  ], [i18n.language, t])

  return (
    <div className="space-y-4">
      <ModulePageHeader
        icon={Handshake}
        title={t('dealWorkspace.hub.pages.deals')}
        description={t('dealWorkspace.hub.dealsDescription')}
        actions={<Button onClick={() => navigate('/deals/new')}><Plus size={16} />{t('dealWorkspace.createDeal')}</Button>}
      />
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
    </div>
  )
}
