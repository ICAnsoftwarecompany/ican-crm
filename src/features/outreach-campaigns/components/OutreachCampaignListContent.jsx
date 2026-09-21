import { useTranslation } from 'react-i18next'
import { DataTable } from '../../../shared/components/data-table'

export function OutreachCampaignListContent({ campaigns, columns, query, onView }) {
  const { t } = useTranslation()
  return (
    <DataTable
      data={campaigns}
      columns={columns}
      tableId="outreach-campaigns"
      isLoading={query.isLoading}
      error={query.error}
      onRetry={query.refetch}
      onRowDoubleClick={onView}
      emptyMessage={t('outreachCampaigns.emptyTable')}
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
