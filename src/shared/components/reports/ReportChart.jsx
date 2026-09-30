import { useTranslation } from 'react-i18next'
import { formatDate } from '../../utils/dateTime'
import { CategoryBarChart } from './CategoryBarChart'
import { ChartCard } from './ChartCard'
import { ShareBar } from './ShareBar'
import { TimeSeriesChart } from './TimeSeriesChart'
import { formatCompactNumber, percentOf } from './reportUtils'

/** Builds the table view for any chart config, so no chart ships without one. */
function buildTable(chart, t, language) {
  if (chart.type === 'timeseries') {
    return {
      columns: [{ key: 'date', label: t('reports.table.date') }, ...chart.series.map((item) => ({ key: item.key, label: item.label, numeric: true }))],
      rows: chart.data.map((point) => ({
        id: point.date,
        date: formatDate(point.date, language, { dateStyle: 'medium' }),
        ...Object.fromEntries(chart.series.map((item) => [item.key, formatCompactNumber(point[item.key], language)])),
      })),
    }
  }

  if (chart.series?.length) {
    return {
      columns: [{ key: 'label', label: t('reports.table.category') }, ...chart.series.map((item) => ({ key: item.key, label: item.label, numeric: true }))],
      rows: chart.data.map((row, index) => ({
        id: row.key ?? index,
        label: row.label,
        ...Object.fromEntries(chart.series.map((item) => [item.key, formatCompactNumber(row[item.key], language)])),
      })),
    }
  }

  const total = chart.data.reduce((sum, row) => sum + (row.value || 0), 0)
  return {
    columns: [
      { key: 'label', label: t('reports.table.category') },
      { key: 'value', label: chart.valueLabel || t('reports.table.value'), numeric: true },
      { key: 'percent', label: t('reports.table.percent'), numeric: true },
    ],
    rows: chart.data.map((row, index) => ({
      id: row.key ?? index,
      label: row.label,
      value: formatCompactNumber(row.value, language),
      percent: `${percentOf(row.value, total)}%`,
    })),
  }
}

function isChartEmpty(chart) {
  if (!chart.data?.length) return true
  if (chart.type === 'timeseries') return chart.data.every((point) => chart.series.every((item) => !point[item.key]))
  if (chart.series?.length) return chart.data.every((row) => chart.series.every((item) => !row[item.key]))
  return chart.data.every((row) => !row.value)
}

/**
 * Renders one chart from a config object inside a ChartCard with its table view.
 *
 * @typedef {Object} ReportChartConfig
 * @property {string} id
 * @property {'timeseries'|'bar'|'share'} type
 * @property {string} title
 * @property {string} [description]
 * @property {'normal'|'wide'} [size]
 * @property {object[]} data
 * @property {{ key: string, label: string, colorIndex?: number }[]} [series] - Required for 'timeseries'.
 * @property {object} [options] - Passed to the chart (variant, orientation, stacked, height...).
 * @property {string} [valueLabel] - Column title of the single value in the table view.
 * @property {string} [emptyText]
 */
export function ReportChart({ chart }) {
  const { t, i18n } = useTranslation()
  const empty = isChartEmpty(chart)
  const table = empty ? null : buildTable(chart, t, i18n.language)
  const common = { ariaLabel: chart.title, ...(chart.options || {}) }

  return (
    <ChartCard title={chart.title} description={chart.description} size={chart.size} table={table} isEmpty={empty} emptyText={chart.emptyText}>
      {chart.type === 'timeseries' && <TimeSeriesChart data={chart.data} series={chart.series} {...common} />}
      {chart.type === 'bar' && <CategoryBarChart data={chart.data} series={chart.series} valueLabel={chart.valueLabel} {...common} />}
      {chart.type === 'share' && <ShareBar data={chart.data} {...common} />}
    </ChartCard>
  )
}
