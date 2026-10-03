import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Banknote, CircleCheckBig, Percent, UserPlus } from 'lucide-react'
import { useUsers } from '../../users'
import { useDealContracts } from '../hooks/useDealContracts'
import { useDealWorkspace } from '../hooks/useDealWorkspace'
import { formatMoney } from '../utils/dealMoney'
import { buildDealReport } from './dealReportModel'
import { toChartRows } from './reportRows'

/** KPIs + charts of the current deal for the shared ReportsPage (computed from the deal's leads + contracts). */
export function useDealReport(range) {
  const { t, i18n } = useTranslation()
  const { dealId, leads, leadsQuery, stages, stageMap } = useDealWorkspace()
  const contractsQuery = useDealContracts({ deal_id: dealId })
  const usersQuery = useUsers()

  return useMemo(() => {
    const report = buildDealReport({ leads, contracts: contractsQuery.contracts, stages, range })
    const users = new Map((usersQuery.data || []).map((user) => [String(user.id), user.name || user.email || '']))
    const optionLabel = (group) => (key) => t(`dealWorkspace.options.${group}.${key}`, key)

    const kpis = [
      { id: 'created', icon: UserPlus, label: t('dealWorkspace.reports.kpis.created'), value: report.created, delta: report.createdDelta },
      { id: 'won', icon: CircleCheckBig, label: t('dealWorkspace.reports.kpis.won'), value: report.won, delta: report.wonDelta },
      { id: 'winRate', icon: Percent, label: t('dealWorkspace.reports.kpis.winRate'), value: `${report.winRate}%`, hint: t('dealWorkspace.reports.kpis.winRateHint') },
      { id: 'revenue', icon: Banknote, label: t('dealWorkspace.reports.kpis.revenue'), value: formatMoney(report.revenue, i18n.language), hint: t('dealWorkspace.reports.kpis.pipelineHint', { value: formatMoney(report.pipelineValue, i18n.language) }) },
    ]

    const leadsLabel = t('dealWorkspace.reports.series.leads')
    const charts = [
      {
        id: 'created-over-time', type: 'timeseries', size: 'wide', title: t('dealWorkspace.reports.charts.createdOverTime'),
        data: report.dailyCreated, series: [{ key: 'count', label: t('dealWorkspace.reports.series.created') }], options: { variant: 'area' },
      },
      {
        id: 'closed-over-time', type: 'timeseries', size: 'wide', title: t('dealWorkspace.reports.charts.closedOverTime'),
        data: report.dailyClosed,
        series: [{ key: 'won', label: optionLabel('leadStatus')('won'), colorIndex: 2 }, { key: 'lost', label: optionLabel('leadStatus')('lost'), colorIndex: 7 }],
      },
      {
        id: 'by-stage', type: 'bar', title: t('dealWorkspace.reports.charts.byStage'), valueLabel: leadsLabel,
        data: report.byStage.map((row) => ({ ...row, label: stageMap.get(row.key)?.label || `#${row.key}` })),
      },
      { id: 'by-status', type: 'share', title: t('dealWorkspace.reports.charts.byStatus'), data: toChartRows(report.byStatus, t, optionLabel('leadStatus')) },
      { id: 'by-source', type: 'bar', title: t('dealWorkspace.reports.charts.bySource'), valueLabel: leadsLabel, data: toChartRows(report.bySource, t) },
      { id: 'by-owner', type: 'bar', title: t('dealWorkspace.reports.charts.byOwner'), valueLabel: leadsLabel, data: toChartRows(report.byOwner, t, (key) => users.get(String(key)) || `#${key}`) },
      { id: 'lost-reasons', type: 'share', size: 'wide', title: t('dealWorkspace.reports.charts.lostReasons'), data: toChartRows(report.lostReasons, t, optionLabel('lostReason')) },
    ]

    return {
      kpis,
      charts,
      recordCount: leads.length,
      isLoading: leadsQuery.isLoading,
      error: leadsQuery.error,
      refetch: () => {
        leadsQuery.refetch()
        contractsQuery.refetch()
      },
    }
  }, [contractsQuery, i18n.language, leads, leadsQuery, range, stageMap, stages, t, usersQuery.data])
}
