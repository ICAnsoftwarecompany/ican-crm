import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartLegend, ChartTooltipContent } from './ChartLegend'
import { CHART_CHROME, CHART_MARKS, CHART_OTHER_COLOR, getSeriesColor } from './reportTokens'
import { formatCompactNumber } from './reportUtils'

const ROW_HEIGHT = 34

/**
 * Magnitude by category. Single series → one color for every bar (slot 1; never a value-ramp on
 * nominal categories) with the value at the bar tip. Multiple series → grouped, or `stacked` with a
 * 2px surface gap between segments. Horizontal by default (long category names read better).
 *
 * @param {object} props
 * @param {object[]} props.data - Single series: [{ key, label, value }]. Multi: [{ label, [seriesKey]: number }].
 * @param {{ key: string, label: string, colorIndex?: number }[]} [props.series] - Omit for single series (`value`).
 * @param {'horizontal'|'vertical'} [props.orientation]
 * @param {boolean} [props.stacked]
 */
export function CategoryBarChart({ data = [], series, orientation = 'horizontal', stacked = false, colorIndex = 0, ariaLabel, valueLabel }) {
  const { i18n } = useTranslation()
  const rtl = i18n.dir?.() === 'rtl'
  const horizontal = orientation === 'horizontal'
  const resolved = useMemo(() => {
    const list = series?.length ? series : [{ key: 'value', label: valueLabel || '', colorIndex }]
    return list.map((item, index) => ({ ...item, color: getSeriesColor(item.colorIndex ?? index) }))
  }, [colorIndex, series, valueLabel])
  const single = resolved.length === 1
  const seriesLabels = Object.fromEntries(resolved.map((item) => [item.key, item.label]))
  const height = horizontal ? Math.max(160, data.length * ROW_HEIGHT * (stacked || single ? 1 : resolved.length * 0.7) + 32) : 256
  const radius = horizontal ? CHART_MARKS.barRadiusHorizontal : CHART_MARKS.barRadiusVertical
  const format = (value) => formatCompactNumber(value, i18n.language)

  const categoryAxis = {
    dataKey: 'label',
    type: 'category',
    tick: CHART_CHROME.tick,
    tickLine: false,
    axisLine: { stroke: CHART_CHROME.grid },
    interval: 0,
  }
  const valueAxis = {
    type: 'number',
    allowDecimals: false,
    tick: CHART_CHROME.tick,
    tickLine: false,
    axisLine: false,
    tickFormatter: format,
  }

  return (
    <div className="grid gap-3">
      {!single && <ChartLegend items={resolved.map((item) => ({ key: item.key, label: item.label, color: item.color, shape: 'rect' }))} />}
      <div style={{ height }} dir="ltr" role="img" aria-label={ariaLabel}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout={horizontal ? 'vertical' : 'horizontal'}
            margin={{ top: 8, right: 36, bottom: 0, left: 8 }}
            barCategoryGap="28%"
            barGap={2}
          >
            <CartesianGrid horizontal={!horizontal} vertical={horizontal} stroke={CHART_CHROME.grid} strokeWidth={1} />
            {/* Axes must be direct children of the chart (Recharts ignores them inside fragments). */}
            <XAxis {...(horizontal ? valueAxis : categoryAxis)} reversed={rtl} />
            <YAxis
              {...(horizontal ? categoryAxis : valueAxis)}
              orientation={rtl ? 'right' : 'left'}
              width={horizontal ? 120 : 40}
            />
            <Tooltip
              cursor={{ fill: 'var(--surface-2)' }}
              content={<ChartTooltipContent seriesLabels={seriesLabels} valueFormatter={formatCompactNumber} />}
            />
            {resolved.map((item, index) => (
              <Bar
                key={item.key}
                dataKey={item.key}
                name={item.label}
                fill={item.color}
                stackId={stacked ? 'stack' : undefined}
                maxBarSize={CHART_MARKS.barSize}
                radius={stacked && index < resolved.length - 1 ? 0 : radius}
                stroke={stacked ? 'var(--surface)' : undefined}
                strokeWidth={stacked ? 2 : 0}
                isAnimationActive={false}
              >
                {/* Single series: one color for every bar; only the folded "Other" row (colorIndex -1) is neutral. */}
                {single && data.map((row, rowIndex) => (
                  <Cell key={row.key ?? rowIndex} fill={row.colorIndex === -1 ? CHART_OTHER_COLOR : item.color} />
                ))}
                {single && (
                  <LabelList
                    dataKey={item.key}
                    // 'right' is the bar tip in both directions: with the reversed (RTL) axis Recharts
                    // draws the bar with a negative width, so its "right" edge is the visual tip.
                    position={horizontal ? 'right' : 'top'}
                    formatter={format}
                    style={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  />
                )}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
