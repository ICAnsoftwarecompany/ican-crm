import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatDate } from '../../utils/dateTime'
import { ChartLegend, ChartTooltipContent } from './ChartLegend'
import { CHART_CHROME, CHART_MARKS, getSeriesColor } from './reportTokens'
import { formatCompactNumber } from './reportUtils'

/**
 * Trend over time. One y-axis only (never dual-axis), 2px lines, crosshair tooltip listing every
 * series, legend (≥ 2 series) with the latest value. `variant="area"` is for a single series.
 *
 * @param {object} props
 * @param {object[]} props.data - Points like { date: 'YYYY-MM-DD', [seriesKey]: number } (see buildDailySeries).
 * @param {{ key: string, label: string, colorIndex?: number }[]} props.series
 * @param {'line'|'area'} [props.variant]
 * @param {number} [props.height]
 */
export function TimeSeriesChart({ data = [], series = [], xKey = 'date', variant = 'line', height = 256, ariaLabel }) {
  const { i18n } = useTranslation()
  const rtl = i18n.dir?.() === 'rtl'
  const resolved = useMemo(
    () => series.map((item, index) => ({ ...item, color: getSeriesColor(item.colorIndex ?? index) })),
    [series]
  )
  const seriesLabels = Object.fromEntries(resolved.map((item) => [item.key, item.label]))
  const last = data[data.length - 1]
  const shortDate = (value) => formatDate(value, i18n.language, { day: 'numeric', month: 'short' })
  const useArea = variant === 'area' && resolved.length === 1
  const ChartRoot = useArea ? AreaChart : LineChart

  return (
    <div className="grid gap-3">
      <ChartLegend
        items={resolved.map((item) => ({
          key: item.key,
          label: item.label,
          color: item.color,
          shape: 'line',
          value: last ? formatCompactNumber(last[item.key], i18n.language) : undefined,
        }))}
      />
      <div style={{ height }} dir="ltr" role="img" aria-label={ariaLabel}>
        <ResponsiveContainer width="100%" height="100%">
          <ChartRoot data={data} margin={{ top: 8, right: 12, bottom: 0, left: 12 }}>
            <CartesianGrid vertical={false} stroke={CHART_CHROME.grid} strokeWidth={1} />
            <XAxis
              dataKey={xKey}
              reversed={rtl}
              tick={CHART_CHROME.tick}
              tickLine={false}
              axisLine={{ stroke: CHART_CHROME.grid }}
              tickFormatter={shortDate}
              minTickGap={24}
            />
            <YAxis
              orientation={rtl ? 'right' : 'left'}
              allowDecimals={false}
              tick={CHART_CHROME.tick}
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(value) => formatCompactNumber(value, i18n.language)}
            />
            <Tooltip
              cursor={{ stroke: CHART_CHROME.axis, strokeWidth: 1 }}
              content={(
                <ChartTooltipContent
                  seriesLabels={seriesLabels}
                  labelFormatter={(value) => formatDate(value, i18n.language, { dateStyle: 'medium' })}
                  valueFormatter={formatCompactNumber}
                />
              )}
            />
            {resolved.map((item) => (useArea ? (
              <Area
                key={item.key}
                type="linear"
                dataKey={item.key}
                name={item.label}
                stroke={item.color}
                strokeWidth={CHART_MARKS.lineWidth}
                fill={item.color}
                fillOpacity={CHART_MARKS.areaOpacity}
                dot={false}
                activeDot={{ r: CHART_MARKS.dotRadius, strokeWidth: 2, stroke: 'var(--surface)' }}
                isAnimationActive={false}
              />
            ) : (
              <Line
                key={item.key}
                type="linear"
                dataKey={item.key}
                name={item.label}
                stroke={item.color}
                strokeWidth={CHART_MARKS.lineWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={false}
                activeDot={{ r: CHART_MARKS.dotRadius, strokeWidth: 2, stroke: 'var(--surface)' }}
                isAnimationActive={false}
              />
            )))}
          </ChartRoot>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
