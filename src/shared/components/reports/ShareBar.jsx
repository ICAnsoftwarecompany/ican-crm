import { useTranslation } from 'react-i18next'
import { ChartLegend } from './ChartLegend'
import { getSeriesColor } from './reportTokens'
import { formatCompactNumber, percentOf } from './reportUtils'

/**
 * Part-to-whole at a glance: one 100% bar split into ≤ 8 segments (2px surface gap between them),
 * legend with value and percent. Use it instead of a pie/donut. Rows come from countBy (the
 * folded "Other" row uses the neutral color via `colorIndex: -1`).
 *
 * @param {{ key: string, label: string, value: number, colorIndex?: number }[]} props.data
 */
export function ShareBar({ data = [], ariaLabel }) {
  const { i18n } = useTranslation()
  const total = data.reduce((sum, row) => sum + (row.value || 0), 0)
  const rows = data.map((row, index) => ({ ...row, color: getSeriesColor(row.colorIndex ?? index), percent: percentOf(row.value, total) }))

  return (
    <div className="grid gap-3">
      <div role="img" aria-label={ariaLabel} className="flex h-4 w-full gap-[2px] overflow-hidden rounded-full bg-[var(--surface-2)]">
        {total > 0 && rows.filter((row) => row.value > 0).map((row) => (
          <span
            key={row.key}
            title={`${row.label}: ${formatCompactNumber(row.value, i18n.language)} (${row.percent}%)`}
            className="h-full first:rounded-s-full last:rounded-e-full"
            style={{ width: `${(row.value / total) * 100}%`, background: row.color }}
          />
        ))}
      </div>
      <ChartLegend
        items={rows.map((row) => ({
          key: row.key,
          label: row.label,
          color: row.color,
          shape: 'rect',
          value: `${formatCompactNumber(row.value, i18n.language)} · ${row.percent}%`,
        }))}
      />
    </div>
  )
}
