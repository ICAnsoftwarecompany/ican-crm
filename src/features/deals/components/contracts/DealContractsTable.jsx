import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DataTable } from '../../../../shared/components/data-table'
import { Badge } from '../../../../shared/components/ui/Badge'
import { formatDate } from '../../../../shared/utils/dateTime'
import { useDealContracts } from '../../hooks/useDealContracts'
import { summarizeContract } from '../../utils/dealContracts'
import { formatMoney } from '../../utils/dealMoney'
import { ContractDrawer } from './ContractDrawer'

/**
 * Contracts created by the won flow. With `dealId` → one deal; without → every deal (hub). `?contract=<id>`
 * opens the drawer (links from tasks and the calendar use it), `?filter=overdue` keeps late ones only.
 */
export function DealContractsTable({ dealId }) {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const query = useDealContracts(dealId ? { deal_id: dealId } : {})
  const overdueOnly = params.get('filter') === 'overdue'
  const openId = params.get('contract')

  const rows = useMemo(() => query.contracts
    .map((contract) => ({ ...contract, summary: summarizeContract(contract) }))
    .filter((contract) => !overdueOnly || contract.summary.overdueCount > 0), [overdueOnly, query.contracts])

  const columns = useMemo(() => [
    { id: 'number', header: t('dealWorkspace.contracts.number'), accessor: 'number', filterType: 'text', render: (row) => <span dir="ltr" className="font-semibold">{row.number}</span> },
    { id: 'lead', header: t('dealWorkspace.contracts.customer'), accessor: 'leadName', filterType: 'text', render: (row) => row.leadName || (row.leadId ? `#${row.leadId}` : '—') },
    ...(dealId ? [] : [{ id: 'deal', header: t('dealWorkspace.contracts.deal'), accessor: 'dealName', render: (row) => row.dealName || (row.dealId ? `#${row.dealId}` : '—') }]),
    { id: 'total', header: t('dealWorkspace.contracts.total'), accessor: 'total', filterType: 'number', render: (row) => <span dir="ltr">{formatMoney(row.total, i18n.language)}</span> },
    { id: 'remaining', header: t('dealWorkspace.contracts.remaining'), accessor: 'summary.remaining', render: (row) => <span dir="ltr">{formatMoney(row.summary.remaining, i18n.language)}</span> },
    { id: 'paymentType', header: t('dealWorkspace.contracts.paymentType'), accessor: 'paymentType', filterType: 'text', render: (row) => t(`dealWorkspace.options.paymentType.${row.paymentType}`, row.paymentType) },
    {
      id: 'overdue', header: t('dealWorkspace.contracts.overdue'), accessor: 'summary.overdueCount',
      render: (row) => (row.summary.overdueCount ? <Badge variant="danger">{row.summary.overdueCount}</Badge> : '—'),
    },
    { id: 'signedAt', header: t('dealWorkspace.contracts.signedAt'), accessor: 'signedAt', filterType: 'date', render: (row) => (row.signedAt ? formatDate(row.signedAt, i18n.language) : '—') },
  ], [dealId, i18n.language, t])

  const setContract = (id) => setParams((current) => {
    const next = new URLSearchParams(current)
    if (id) next.set('contract', id)
    else next.delete('contract')
    return next
  }, { replace: true })

  return (
    <>
      <DataTable
        data={rows}
        columns={columns}
        tableId={dealId ? `deal-${dealId}-contracts` : 'deals-contracts'}
        isLoading={query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        onRowClick={(row) => setContract(row.id)}
        emptyMessage={overdueOnly ? t('dealWorkspace.contracts.noOverdue') : t('dealWorkspace.contracts.empty')}
        enableSorting
        enableFiltering
        enableColumnVisibility
        enableExport
        showToolbar
        showFooter
      />
      <ContractDrawer contractId={openId} open={Boolean(openId)} onClose={() => setContract(null)} showDealLink={!dealId} />
    </>
  )
}
