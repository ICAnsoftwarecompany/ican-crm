import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CircleOff, FolderTree, Package, PackagePlus } from 'lucide-react'
import { buildDailySeries } from '../../../shared/components/reports'
import { useProducts } from '../hooks/useProducts'
import { buildProductsReport, flattenCatalog } from './productsReportModel'

const SPECIAL_KEYS = { __none__: 'reports.none', __other__: 'reports.other' }

function toRows(rows, t, labelFor = (key) => key) {
  return rows.map((row) => ({
    key: row.key,
    value: row.value,
    label: SPECIAL_KEYS[row.key] ? t(SPECIAL_KEYS[row.key]) : labelFor(row.key),
    colorIndex: row.key === '__other__' ? -1 : undefined,
  }))
}

/** Products & Services report for the shared ReportsPage (added 2026-10-01). */
export function useProductsReport(range) {
  const { t } = useTranslation()
  const query = useProducts()

  return useMemo(() => {
    const rows = flattenCatalog(Array.isArray(query.data) ? query.data : [])
    const report = buildProductsReport(rows, range)

    const kpis = [
      { id: 'total', icon: Package, label: t('products.reports.kpis.total'), value: report.total },
      { id: 'added', icon: PackagePlus, label: t('products.reports.kpis.added'), value: report.added },
      { id: 'inactive', icon: CircleOff, label: t('products.reports.kpis.inactive'), value: report.inactive, positiveIsGood: false },
      { id: 'categories', icon: FolderTree, label: t('products.reports.kpis.categories'), value: report.categories },
    ]

    const charts = [
      {
        id: 'by-category',
        type: 'bar',
        size: 'wide',
        title: t('products.reports.charts.byCategory'),
        data: toRows(report.byCategory, t),
        valueLabel: t('products.reports.series.items'),
      },
      {
        id: 'by-type',
        type: 'share',
        title: t('products.reports.charts.byType'),
        data: toRows(report.byType, t, (key) => t(`products.reports.types.${key}`, { defaultValue: key })),
      },
      {
        id: 'by-status',
        type: 'share',
        title: t('products.reports.charts.byStatus'),
        data: toRows(report.byStatus, t, (key) => t(`products.reports.statuses.${key}`)),
      },
      {
        id: 'added-over-time',
        type: 'timeseries',
        size: 'wide',
        title: t('products.reports.charts.addedOverTime'),
        data: buildDailySeries(rows, (row) => row.createdAt, { range }),
        series: [{ key: 'count', label: t('products.reports.series.added') }],
        options: { variant: 'area' },
        emptyText: t('products.reports.noDates'),
      },
    ]

    return { kpis, charts, recordCount: rows.length, isLoading: query.isLoading, error: query.error, refetch: query.refetch }
  }, [query.data, query.error, query.isLoading, query.refetch, range, t])
}
