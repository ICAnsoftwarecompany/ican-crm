import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable } from '../../../shared/components/data-table'
import { Badge } from '../../../shared/components/ui/Badge'
import { displayValue } from '../../../shared/utils/apiResponse'
import { getCampaignResultCount } from '../../../features/campaigns/facebook-campaign'
import { formatDate, formatNumber, formatPercent, formatCurrencyValue } from '../utils/campaignFormatters'

export function CampaignListTable({ campaigns, platformId, tableId = 'campaign-center-list', onRowClick }) {
  const { t, i18n } = useTranslation()
  const columns = useMemo(() => [
    { id: 'name', header: t('campaigns.columns.campaign'), accessor: 'name', searchable: true, sortable: true, filterable: true, render: (row) => <span className="font-bold text-[var(--text)]">{displayValue(row.name || row.campaign_name)}</span> },
    { id: 'page', header: t('campaigns.columns.page'), accessor: 'page_name', searchable: true, sortable: true, render: (row) => displayValue(row.page_name) },
    { id: 'platform', header: t('campaigns.columns.platform'), accessor: 'platform', render: () => t(`campaigns.platforms.${platformId}`) },
    { id: 'status', header: t('campaigns.columns.status'), accessor: 'status', sortable: true, filterable: true, render: (row) => <Badge variant={String(row.status).toLowerCase() === 'active' ? 'success' : 'default'}>{displayValue(row.status)}</Badge> },
    { id: 'objective', header: t('campaigns.columns.objective'), accessor: 'objective', searchable: true, sortable: true },
    { id: 'budget', header: t('campaigns.columns.budget'), accessor: 'daily_budget', sortable: true, render: (row) => row.daily_budget || row.lifetime_budget ? formatCurrencyValue(row.daily_budget ?? row.lifetime_budget, row.account_currency, i18n.language) : displayValue(row.budget) },
    { id: 'spend', header: t('campaigns.columns.spend'), accessor: 'spend', sortable: true, render: (row) => formatCurrencyValue(row.spend, row.account_currency, i18n.language) },
    { id: 'impressions', header: t('campaigns.columns.impressions'), accessor: 'impressions', sortable: true, render: (row) => formatNumber(row.impressions, i18n.language) },
    { id: 'reach', header: t('campaigns.columns.reach'), accessor: 'reach', sortable: true, render: (row) => formatNumber(row.reach, i18n.language) },
    { id: 'ctr', header: t('campaigns.columns.ctr'), accessor: 'ctr', sortable: true, render: (row) => formatPercent(row.ctr) },
    {
      id: 'results',
      header: t('campaigns.columns.results'),
      accessor: 'results',
      sortable: true,
      render: (row) => {
        const count = getCampaignResultCount(row)
        return count === null ? <span className="text-[var(--text-muted)]">{t('campaigns.metrics.notAvailable')}</span> : formatNumber(count, i18n.language)
      },
    },
    { id: 'start', header: t('campaigns.columns.startDate'), accessor: 'start_time', sortable: true, render: (row) => <span dir="ltr">{formatDate(row.start_time || row.start_date, i18n.language)}</span> },
    { id: 'end', header: t('campaigns.columns.endDate'), accessor: 'stop_time', sortable: true, render: (row) => <span dir="ltr">{formatDate(row.stop_time || row.end_date, i18n.language)}</span> },
    { id: 'sync', header: t('campaigns.columns.lastSync'), accessor: 'synced_at', sortable: true, render: (row) => <span dir="ltr">{formatDate(row.synced_at || row.updated_at, i18n.language)}</span> },
  ], [platformId, t, i18n.language])
  return <DataTable data={campaigns} columns={columns} tableId={`${tableId}-${platformId}`} onRowClick={onRowClick} emptyMessage={t('campaigns.noCampaigns')} enableSorting enableFiltering enableGlobalSearch enablePagination enableColumnVisibility enableExport showToolbar showFooter />
}
