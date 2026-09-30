/**
 * Chart tokens for the shared reports engine. Colors are CSS variables from src/index.css
 * (light + dark are defined there), so charts follow the theme without code changes.
 *
 * Categorical slots are assigned in FIXED order and follow the entity, never its rank:
 * a series keeps its slot even when a filter hides others (pass `colorIndex` explicitly
 * when the series set can change).
 */
export const CHART_SERIES_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-7)',
  'var(--chart-8)',
]

/** Never generate a 9th hue: the tail folds into "Other" (see countBy's `limit`). */
export const CHART_MAX_SERIES = CHART_SERIES_COLORS.length

export const CHART_CHROME = {
  grid: 'var(--chart-grid)',
  axis: 'var(--chart-axis)',
  tick: { fill: 'var(--text-muted)', fontSize: 11 },
}

/** Mark specs from the dataviz guide: thin bars with a rounded data end, 2px lines. */
export const CHART_MARKS = {
  barSize: 18,
  barRadiusVertical: [4, 4, 0, 0],
  barRadiusHorizontal: [0, 4, 4, 0],
  lineWidth: 2,
  dotRadius: 4,
  areaOpacity: 0.1,
}

/** Neutral color for the folded "Other" row and anything past the 8 slots — never a new hue. */
export const CHART_OTHER_COLOR = 'var(--chart-other)'

export function getSeriesColor(index) {
  if (index < 0 || index >= CHART_MAX_SERIES) return CHART_OTHER_COLOR
  return CHART_SERIES_COLORS[index]
}
