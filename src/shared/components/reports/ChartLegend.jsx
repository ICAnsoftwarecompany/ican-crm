import { useTranslation } from 'react-i18next'

/**
 * Identity channel for every chart with ≥ 2 series. Mirrors the mark: a short line for lines,
 * a rounded square for bars/segments. Text stays in text tokens — never the series color.
 */
export function ChartLegend({ items = [] }) {
  if (items.length < 2) return null
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
      {items.map((item) => (
        <li key={item.key} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={item.shape === 'line' ? 'h-0.5 w-4 rounded-full' : 'h-2.5 w-2.5 rounded-sm'}
            style={{ background: item.color }}
          />
          <span>{item.label}</span>
          {item.value !== undefined && item.value !== null && (
            <span className="font-semibold text-[var(--text)]" dir="ltr">{item.value}</span>
          )}
        </li>
      ))}
    </ul>
  )
}

/**
 * Recharts tooltip content: value first (strong), series name second, keyed by a short line.
 * Lists every series at the hovered position.
 */
export function ChartTooltipContent({ active, payload, label, labelFormatter, valueFormatter, seriesLabels = {} }) {
  const { i18n } = useTranslation()
  if (!active || !payload?.length) return null
  const title = labelFormatter ? labelFormatter(label, payload) : label

  return (
    <div className="min-w-[140px] rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs shadow-lg">
      {title !== undefined && title !== null && title !== '' && (
        <p className="mb-1 font-medium text-[var(--text-muted)]">{title}</p>
      )}
      <ul className="space-y-0.5">
        {payload.map((entry) => (
          <li key={entry.dataKey ?? entry.name} className="flex items-center gap-2">
            <span aria-hidden="true" className="h-0.5 w-3 rounded-full" style={{ background: entry.color || entry.payload?.fill }} />
            <span className="font-semibold text-[var(--text)]" dir="ltr">
              {valueFormatter ? valueFormatter(entry.value, i18n.language) : entry.value}
            </span>
            <span className="text-[var(--text-muted)]">{seriesLabels[entry.dataKey] ?? entry.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
