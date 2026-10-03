import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Banknote, Briefcase, FileSignature, Target } from 'lucide-react'
import { useDealContracts } from '../hooks/useDealContracts'
import { useDeals } from '../hooks/useDeals'
import { getDealStatusValue } from '../utils/dealDisplay'
import { formatMoney } from '../utils/dealMoney'
import { buildDealsHubReport } from './dealReportModel'
import { toChartRows } from './reportRows'

/** Reports across every deal (hub `/deals/reports`). */
export function useDealsHubReport(range) {
  const { t, i18n } = useTranslation()
  const dealsQuery = useDeals()
  const contractsQuery = useDealContracts({})

  return useMemo(() => {
    const deals = dealsQuery.deals.map((deal) => ({ ...deal, statusValue: getDealStatusValue(deal.status) }))
    const names = new Map(deals.map((deal) => [String(deal.id), deal.name || `#${deal.id}`]))
    const report = buildDealsHubReport({ deals, contracts: contractsQuery.contracts, range })
    const option = (group) => (key) => t(`dealWorkspace.options.${group}.${key}`, key)
    return {
      kpis: [
        { id: 'active', icon: Briefcase, label: t('dealWorkspace.hub.reports.kpis.active'), value: report.active, hint: t('dealWorkspace.hub.reports.kpis.totalHint', { count: report.total }) },
        { id: 'created', icon: Target, label: t('dealWorkspace.hub.reports.kpis.created'), value: report.created, delta: report.createdDelta },
        { id: 'contracts', icon: FileSignature, label: t('dealWorkspace.hub.reports.kpis.contracts'), value: report.contracts },
        { id: 'revenue', icon: Banknote, label: t('dealWorkspace.hub.reports.kpis.revenue'), value: formatMoney(report.revenue, i18n.language), hint: t('dealWorkspace.hub.reports.kpis.targetHint', { value: formatMoney(report.targetRevenue, i18n.language) }) },
      ],
      charts: [
        { id: 'contracts-over-time', type: 'timeseries', size: 'wide', title: t('dealWorkspace.hub.reports.charts.contractsOverTime'), data: report.dailyContracts, series: [{ key: 'count', label: t('dealWorkspace.hub.reports.series.contracts') }], options: { variant: 'area' } },
        { id: 'by-status', type: 'share', title: t('dealWorkspace.hub.reports.charts.byStatus'), data: toChartRows(report.byStatus, t, option('dealStatus')) },
        { id: 'by-type', type: 'bar', title: t('dealWorkspace.hub.reports.charts.byType'), valueLabel: t('dealWorkspace.hub.reports.series.deals'), data: toChartRows(report.byType, t, option('dealType')) },
        { id: 'contracts-by-deal', type: 'bar', size: 'wide', title: t('dealWorkspace.hub.reports.charts.contractsByDeal'), valueLabel: t('dealWorkspace.hub.reports.series.contracts'), data: toChartRows(report.contractsByDeal, t, (key) => names.get(String(key)) || `#${key}`) },
      ],
      recordCount: deals.length,
      isLoading: dealsQuery.isLoading,
      error: dealsQuery.error,
      refetch: () => {
        dealsQuery.refetch()
        contractsQuery.refetch()
      },
    }
  }, [contractsQuery, dealsQuery, i18n.language, range, t])
}
