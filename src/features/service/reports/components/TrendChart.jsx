import { useTranslation } from 'react-i18next'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatDate } from '../../../../shared/utils/dateTime'

const SERIES = [
  { key: 'created', color: 'var(--chart-1)' },
  { key: 'resolved', color: 'var(--chart-2)' },
]

function TrendTooltip({ active, payload, label, language, t }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-[var(--text)]">{formatDate(label, language, { dateStyle: 'medium' })}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="flex items-center gap-2 text-[var(--text-muted)]">
          <span className="h-0.5 w-3 rounded-full" style={{ background: entry.color }} aria-hidden="true" />
          {t(`service.reports.series.${entry.dataKey}`)}
          <span className="ms-auto font-semibold text-[var(--text)]" dir="ltr">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

/**
 * Created vs resolved over time. Two categorical slots (--chart-1/2, validated
 * light + dark), 2px lines, one y-axis, legend + end-value labels so identity
 * never relies on color alone; the table view sits under the chart.
 */
export function TrendChart({ data = [] }) {
  const { t, i18n } = useTranslation()
  const rtl = i18n.dir?.() === 'rtl'
  const last = data[data.length - 1]
  const tick = { fill: 'var(--text-muted)', fontSize: 11 }
  const shortDate = (value) => formatDate(value, i18n.language, { day: 'numeric', month: 'short' })

  return (
    <figure className="grid gap-3">
      <figcaption className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
        {SERIES.map((series) => (
          <span key={series.key} className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ background: series.color }} aria-hidden="true" />
            {t(`service.reports.series.${series.key}`)}
            {last && <span className="font-semibold text-[var(--text)]" dir="ltr">{last[series.key]}</span>}
          </span>
        ))}
      </figcaption>
      <div className="h-64" dir="ltr" role="img" aria-label={t('service.reports.trendTitle')}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 12 }}>
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeWidth={1} />
            <XAxis dataKey="date" reversed={rtl} tick={tick} tickLine={false} axisLine={{ stroke: 'var(--chart-grid)' }} tickFormatter={shortDate} minTickGap={24} />
            <YAxis orientation={rtl ? 'right' : 'left'} allowDecimals={false} tick={tick} tickLine={false} axisLine={false} width={32} />
            <Tooltip content={<TrendTooltip language={i18n.language} t={t} />} cursor={{ stroke: 'var(--text-muted)', strokeWidth: 1 }} />
            {SERIES.map((series) => (
              <Line
                key={series.key}
                type="monotone"
                dataKey={series.key}
                stroke={series.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={false}
                activeDot={{ r: 4, fill: series.color, stroke: 'var(--surface)', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <details className="text-xs text-[var(--text-muted)]">
        <summary className="w-fit cursor-pointer select-none">{t('service.reports.viewTable')}</summary>
        <div className="mt-2 max-h-56 overflow-y-auto rounded-md border border-[var(--border)]">
          <table className="w-full text-start">
            <thead className="sticky top-0 bg-[var(--surface-2)] text-[var(--text)]">
              <tr>
                <th className="px-3 py-1.5 text-start font-medium">{t('service.reports.date')}</th>
                {SERIES.map((series) => (
                  <th key={series.key} className="px-3 py-1.5 text-end font-medium">{t(`service.reports.series.${series.key}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.date} className="border-t border-[var(--border)]">
                  <td className="px-3 py-1">{formatDate(row.date, i18n.language, { dateStyle: 'medium' })}</td>
                  {SERIES.map((series) => (
                    <td key={series.key} className="px-3 py-1 text-end text-[var(--text)]" dir="ltr">{row[series.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}
