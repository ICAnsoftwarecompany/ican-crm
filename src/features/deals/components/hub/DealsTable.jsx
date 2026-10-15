import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DataTable } from '../../../../shared/components/data-table'
import { useUsers } from '../../../users'
import { usePipelineTemplates } from '../../hooks/useDeals'
import { buildDealCompleteness } from '../../utils/dealCompleteness'
import { useQuickInfoLabels } from './DealQuickInfo'
import { DealQuickDrawer } from './DealQuickDrawer'
import { useDealFields } from './useDealFields'

const DAY_MS = 86400000
const daysUntil = (value, now = Date.now()) => {
  if (!value) return null
  const end = new Date(`${String(value).slice(0, 10)}T23:59:59`).getTime()
  return Number.isNaN(end) ? null : Math.max(0, Math.ceil((end - now) / DAY_MS))
}

/**
 * Every deal of the tenant as a table with all its data as columns (useDealFields), including setup completeness.
 * The icon beside the name opens the same data in a drawer (DealQuickDrawer, with "open deal page" on top);
 * clicking a row opens the deal's workspace.
 */
export function DealsTable({ deals, infos, leadsByDeal = new Map(), query }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const labels = useQuickInfoLabels()
  const fields = useDealFields()
  const { templates } = usePipelineTemplates()
  const usersQuery = useUsers()
  const [drawerId, setDrawerId] = useState(null)

  // Quick info + names as plain columns, so everything sorts, filters and exports like the rest.
  const rows = useMemo(() => {
    const templateNames = new Map(templates.map((template) => [String(template.id), template.name]))
    const userNames = new Map((usersQuery.data || []).map((user) => [String(user.id), user.name || user.email || '']))
    return deals.map((deal) => {
      const id = String(deal.id)
      const info = infos.get(id)
      const listCount = deal.leads_count ?? deal.deal_leads_count
      const leadsCount = listCount !== undefined && listCount !== null ? Number(listCount) : leadsByDeal.get(id)?.length ?? null
      const completeness = buildDealCompleteness(deal, { productsCount: info?.productsCount ?? null, teamCount: info?.teamCount ?? null, leadsCount })
      return {
        ...deal,
        leadsCount,
        typeLabel: deal.type ? t(`dealWorkspace.options.dealType.${deal.type}`, deal.type) : '',
        pipelineName: deal.pipeline_template?.name || deal.pipelineTemplate?.name || templateNames.get(String(deal.pipeline_template_id)) || '',
        ownerName: deal.owner?.name || deal.owner_name || userNames.get(String(deal.owner_id)) || '',
        productsLabel: labels.products(info),
        productsCount: info?.productsCount ?? null,
        teamLabel: labels.team(info),
        teamCount: info?.teamCount ?? null,
        lastActionLabel: labels.lastAction(info),
        lastActionAt: info?.lastAction?.at || '',
        daysLeft: daysUntil(deal.end_date),
        completeness,
        completenessScore: completeness.score,
      }
    })
  }, [deals, infos, labels, leadsByDeal, t, templates, usersQuery.data])

  const columns = useMemo(() => fields.map((field) => ({
    id: field.id,
    header: field.label,
    accessor: field.accessor,
    filterType: field.filterType,
    filterOptions: field.filterOptions,
    render: field.render,
    ...(field.id === 'name' ? { drawerTrigger: true } : {}),
  })), [fields])
  const drawerRow = drawerId ? rows.find((row) => String(row.id) === drawerId) : null

  return (
    <>
      <DataTable
        data={rows}
        columns={columns}
        tableId="deals-workspace"
        isLoading={query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        onRowClick={(row) => navigate(`/deals/${row.id}`)}
        onOpenRowDrawer={(row) => setDrawerId(String(row.id))}
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
      <DealQuickDrawer row={drawerRow} fields={fields} onClose={() => setDrawerId(null)} />
    </>
  )
}
