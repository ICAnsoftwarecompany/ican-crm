// Public API of the shared reports & charts engine. Import only from here.
// Rule (CLAUDE.md rule 12, docs/1-ARCHITECTURE.md#reports-and-charts): every area's "Reports" page
// and every chart in the app is built from this folder. See README.md.

export { ReportsPage } from './ReportsPage'
export { ReportChart } from './ReportChart'
export { ChartCard, ChartTable } from './ChartCard'
export { ChartLegend, ChartTooltipContent } from './ChartLegend'
export { TimeSeriesChart } from './TimeSeriesChart'
export { CategoryBarChart } from './CategoryBarChart'
export { ShareBar } from './ShareBar'
export { StatTile, KpiRow } from './StatTile'
export { ReportRangeFilter, useReportRange } from './ReportRangeFilter'
export {
  CHART_CHROME,
  CHART_MARKS,
  CHART_MAX_SERIES,
  CHART_OTHER_COLOR,
  CHART_SERIES_COLORS,
  getSeriesColor,
} from './reportTokens'
export {
  DEFAULT_REPORT_RANGE,
  REPORT_RANGES,
  buildDailySeries,
  countBy,
  filterByRange,
  filterPreviousRange,
  formatCompactNumber,
  getRangeStart,
  percentChange,
  percentOf,
  toDayKey,
  toReportDate,
} from './reportUtils'
