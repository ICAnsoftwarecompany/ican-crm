import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Banknote, CircleCheckBig, CircleX, Hourglass, Layers, Percent, Target, Users } from 'lucide-react'
import { dealTimeProgress } from '../utils/dealAnalytics'
import { formatMoney } from '../utils/dealMoney'

const pct = (value) => (value === null || value === undefined ? '—' : `${Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 })}%`)

/**
 * KPI and chart configs (shared reports engine shapes) from normalized analytics (`useDealAnalytics`).
 * `leadKpis` / `moneyKpis`: two rows of 4 StatTiles; `charts`: stages funnel, status share, owners revenue.
 */
export function useDealAnalyticsView({ overview, owners = [] }) {
  const { t, i18n } = useTranslation()
  return useMemo(() => {
    if (!overview) return { leadKpis: [], moneyKpis: [], charts: [], time: null, percent: pct }
    const { stats, deal, stages } = overview
    const money = (value) => (value === null || value === undefined ? '—' : formatMoney(value, i18n.language))
    const time = dealTimeProgress(deal.startDate, deal.endDate)
    const leadKpis = [
      { id: 'total', icon: Users, label: t('dealWorkspace.analytics.kpis.total'), value: stats.total, hint: deal.targetLeads ? t('dealWorkspace.analytics.kpis.ofTarget', { value: deal.targetLeads.toLocaleString(i18n.language), percent: pct(stats.leadsProgress) }) : t('dealWorkspace.analytics.kpis.noTarget') },
      { id: 'open', icon: Layers, label: t('dealWorkspace.analytics.kpis.open'), value: stats.open },
      { id: 'won', icon: CircleCheckBig, label: t('dealWorkspace.analytics.kpis.won'), value: stats.won, hint: t('dealWorkspace.analytics.kpis.winRateHint', { value: pct(stats.winRate) }) },
      { id: 'lost', icon: CircleX, label: t('dealWorkspace.analytics.kpis.lost'), value: stats.lost, positiveIsGood: false },
    ]
    const moneyKpis = [
      { id: 'revenue', icon: Banknote, label: t('dealWorkspace.analytics.kpis.revenue'), value: money(stats.revenue), hint: deal.targetRevenue ? t('dealWorkspace.analytics.kpis.targetRevenue', { value: money(deal.targetRevenue) }) : t('dealWorkspace.analytics.kpis.noTarget') },
      { id: 'achievement', icon: Target, label: t('dealWorkspace.analytics.kpis.achievement'), value: pct(stats.achievement), hint: t('dealWorkspace.analytics.kpis.achievementHint') },
      { id: 'winRate', icon: Percent, label: t('dealWorkspace.analytics.kpis.winRate'), value: pct(stats.winRate), hint: t('dealWorkspace.analytics.kpis.winRateFormula') },
      { id: 'time', icon: Hourglass, label: t('dealWorkspace.analytics.kpis.daysLeft'), value: time ? String(time.daysLeft) : '—', hint: time ? t('dealWorkspace.analytics.kpis.elapsed', { percent: time.elapsedPercent, days: time.totalDays }) : t('dealWorkspace.analytics.kpis.noPeriod') },
    ]
    const leadsLabel = t('dealWorkspace.reports.series.leads')
    const charts = [
      {
        id: 'analytics-stages', type: 'bar', title: t('dealWorkspace.analytics.charts.stages'), description: t('dealWorkspace.analytics.charts.stagesHint'),
        valueLabel: leadsLabel, data: stages.map((stage) => ({ key: stage.id, label: stage.name, value: stage.count })),
      },
      {
        id: 'analytics-status', type: 'share', title: t('dealWorkspace.analytics.charts.status'),
        data: [
          { key: 'open', label: t('dealWorkspace.analytics.kpis.open'), value: stats.open, colorIndex: 0 },
          { key: 'won', label: t('dealWorkspace.analytics.kpis.won'), value: stats.won, colorIndex: 2 },
          { key: 'lost', label: t('dealWorkspace.analytics.kpis.lost'), value: stats.lost, colorIndex: 7 },
        ],
      },
      {
        id: 'analytics-owners', type: 'bar', size: 'wide', title: t('dealWorkspace.analytics.charts.owners'),
        data: owners.map((owner) => ({ key: owner.id, label: owner.name, leads: owner.leads, won: owner.won })),
        series: [{ key: 'leads', label: leadsLabel, colorIndex: 0 }, { key: 'won', label: t('dealWorkspace.analytics.kpis.won'), colorIndex: 2 }],
      },
    ]
    return { leadKpis, moneyKpis, charts, time, percent: pct }
  }, [i18n.language, overview, owners, t])
}
