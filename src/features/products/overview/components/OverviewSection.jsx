import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BriefcaseBusiness, Coins, ListTodo, Package, Power } from 'lucide-react'
import { KpiRow, ReportChart } from '../../../../shared/components/reports'
import { useNumberFormat } from '../../components/common/catalogUi'

/**
 * One block of the overview (products or services, 2026-10-15): headline numbers, then the categories and item types
 * with the most items, and how complete the items are. Every chart comes from the shared reports engine.
 */
export function OverviewSection({ kind, section }) {
  const { t } = useTranslation()
  const formatNumber = useNumberFormat()
  const isService = kind === 'service'
  const listPath = isService ? '/products/services' : '/products'
  const translate = (rows) => rows.map((row) => ({
    ...row,
    label: row.key === '__none__' ? t('productOverview.none') : row.key === '__other__' ? t('reports.other') : row.label,
  }))

  const kpis = [
    { id: 'count', label: t(`productOverview.section.count.${kind}`), value: section.count, icon: isService ? BriefcaseBusiness : Package, hint: t('productOverview.section.activeHint', { count: section.active }) },
    { id: 'value', label: t('productOverview.section.listValue'), value: formatNumber(section.listValue), icon: Coins, hint: t('productOverview.section.averagePrice', { value: formatNumber(section.averagePrice) }) },
    isService
      ? { id: 'types', label: t('productOverview.section.itemTypes'), value: section.itemTypes, icon: Power, hint: t('productOverview.section.withoutType', { count: section.withoutType }) }
      : { id: 'stock', label: t('productOverview.section.stockValue'), value: formatNumber(section.stockValue), icon: Power, hint: t('productOverview.section.itemTypesHint', { count: section.itemTypes }) },
    { id: 'complete', label: t('productOverview.section.completeness'), value: `${section.averageCompleteness}%`, icon: ListTodo, hint: t('productOverview.section.incomplete', { count: section.incomplete }) },
  ]

  const charts = [
    { id: `${kind}-categories`, type: 'bar', title: t('productOverview.charts.topCategories'), data: translate(section.topCategories), valueLabel: t(`productOverview.charts.itemsLabel.${kind}`), emptyText: t('productOverview.charts.empty') },
    { id: `${kind}-types`, type: 'bar', title: t('productOverview.charts.topItemTypes'), data: translate(section.topItemTypes), valueLabel: t(`productOverview.charts.itemsLabel.${kind}`), emptyText: t('productOverview.charts.empty') },
    {
      id: `${kind}-completeness`, type: 'share', size: 'wide', title: t('productOverview.charts.completeness'),
      data: section.completenessLevels.map((row) => ({ ...row, label: t(`productOverview.levels.${row.key}`) })),
      emptyText: t('productOverview.charts.empty'),
    },
  ]

  return (
    <section className="space-y-3" aria-labelledby={`overview-${kind}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={`overview-${kind}`} className="text-lg font-bold text-[var(--text)]">{t(`productOverview.section.title.${kind}`)}</h2>
        <Link to={listPath} className="text-sm font-semibold text-[var(--brand-accent)] hover:underline">{t(`productOverview.section.openList.${kind}`)}</Link>
      </div>
      <KpiRow items={kpis} />
      <div className="grid gap-3 lg:grid-cols-2">
        {charts.map((chart) => <ReportChart key={chart.id} chart={chart} />)}
      </div>
    </section>
  )
}
