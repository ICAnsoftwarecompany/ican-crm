import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Banknote, CircleCheckBig, CircleX, Layers } from 'lucide-react'
import { KpiRow, ReportChart } from '../../../../shared/components/reports'
import { useDealContracts } from '../../hooks/useDealContracts'
import { useDealWorkspace } from '../../hooks/useDealWorkspace'
import { buildDealInsights, buildTargetPace } from '../../utils/dealInsights'
import { formatMoney } from '../../utils/dealMoney'
import { DealProductModeCard } from '../common/DealProductModeCard'
import { ProgressBar } from '../common/ProgressBar'
import { useProductOptions } from '../common/useProductOptions'
import { DealInsightsList } from './DealInsightsList'
import { DealUpcomingWork } from './DealUpcomingWork'

/** Deal home: headline numbers, pace vs target, where the open leads sit, what needs attention, what is next. */
export function DealOverview() {
  const { t, i18n } = useTranslation()
  const { dealId, deal, leads, stages, summary } = useDealWorkspace()
  const contractsQuery = useDealContracts({ deal_id: dealId })
  const productMode = useProductOptions(dealId)
  const insights = useMemo(() => buildDealInsights({ deal, leads, contracts: contractsQuery.contracts }), [contractsQuery.contracts, deal, leads])
  const pace = useMemo(() => buildTargetPace(deal, leads), [deal, leads])
  const revenue = contractsQuery.contracts.reduce((sum, contract) => sum + contract.total, 0)

  const kpis = [
    { id: 'open', icon: Layers, label: t('dealWorkspace.overview.kpis.open'), value: summary.open, hint: t('dealWorkspace.overview.kpis.pipelineValue', { value: formatMoney(summary.pipelineValue, i18n.language) }) },
    { id: 'won', icon: CircleCheckBig, label: t('dealWorkspace.overview.kpis.won'), value: summary.won },
    { id: 'lost', icon: CircleX, label: t('dealWorkspace.overview.kpis.lost'), value: summary.lost, positiveIsGood: false },
    { id: 'revenue', icon: Banknote, label: t('dealWorkspace.overview.kpis.revenue'), value: formatMoney(revenue, i18n.language), hint: t('dealWorkspace.overview.kpis.contracts', { count: contractsQuery.contracts.length }) },
  ]
  const stageChart = {
    id: 'deal-stage-distribution',
    type: 'bar',
    title: t('dealWorkspace.overview.byStage'),
    valueLabel: t('dealWorkspace.reports.series.leads'),
    data: stages.map((stage) => ({ key: String(stage.id), label: stage.label, value: leads.filter((lead) => String(lead.stageId) === String(stage.id) && lead.status === 'open').length })),
  }

  return (
    <div className="space-y-4">
      <KpiRow items={kpis} />
      {!productMode.isLoading && <DealProductModeCard mode={productMode.mode} products={productMode.products} compact />}
      {pace && (
        <section className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 className="text-sm font-bold text-[var(--text)]">{t('dealWorkspace.overview.paceTitle')}</h2>
          <ProgressBar value={pace.elapsedPercent} label={<><span>{t('dealWorkspace.overview.timeElapsed')}</span><span dir="ltr">{pace.elapsedPercent}%</span></>} />
          <ProgressBar value={pace.achievedPercent} label={<><span>{t('dealWorkspace.overview.targetAchieved')}</span><span dir="ltr">{pace.achievedPercent}%</span></>} />
          <p className="text-xs text-[var(--text-muted)]">{t(pace.behind ? 'dealWorkspace.overview.paceBehind' : 'dealWorkspace.overview.paceOk')}</p>
        </section>
      )}
      <div className="grid gap-4 xl:grid-cols-2">
        <ReportChart chart={stageChart} />
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[var(--text)]">{t('dealWorkspace.overview.attention')}</h2>
          <DealInsightsList dealId={dealId} insights={insights} emptyText={t('dealWorkspace.overview.allGood')} />
        </section>
      </div>
      <DealUpcomingWork />
    </div>
  )
}
