# shared/components/reports — reports & charts engine

> **Documentation update:** 2026-10-01 01:49 (Africa/Cairo) — folder created.

**Status:** CURRENT · **Public API:** `index.js` (import only from there) · **Tests:** `reportUtils.test.js` ·
**Playground:** `/playground/reports` (fixed data, every component) · **Strings:** `reports.*`
(`src/locales/{ar,en}/reports.js`) · **Charts library:** Recharts (already in the stack).

One engine for every **"Reports & statistics"** page and every chart in the app. Each area (Leads Center,
Communication modules, Products, …) gets a Reports page in its sub-sidebar built from `ReportsPage`; the area only
computes numbers from its own data. **Rule** (`CLAUDE.md` rule 12,
[docs/1-ARCHITECTURE.md → Reports and charts](../../../../docs/1-ARCHITECTURE.md#reports-and-charts)): do not build a
new chart, stat tile or reports layout outside this folder, and do not import Recharts directly in features/pages.

Domain-agnostic: no imports from `features/`, no API calls. Presentation + pure data helpers only.

---

## 1. Page anatomy

```
ModulePageHeader (icon · title · description · actions)
[ Range filter: 7d | 30d | 90d | 1y | all ]     ← one row above everything it scopes
ModuleNotice (optional warning)
KPI row: 1–4 StatTiles (value · delta vs previous period · hint)
Chart grid (2 columns; size: 'wide' spans both), each chart in a ChartCard with a chart ↔ table toggle
note (data-scope sentence, e.g. "computed from 480 loaded records")
```

Loading / error / empty are handled once by `ReportsPage` (`ResourceState`); each chart also shows its own
"no data in this period" state.

## 2. Components

| Export | Use |
|---|---|
| `ReportsPage` | The whole page from `kpis` + `charts` configs (below). Use this for every area's Reports page. |
| `ReportChart` | One chart from a config, inside a `ChartCard`, with an automatic table view. |
| `TimeSeriesChart` | Trend over time: 1–8 series, **one y-axis**, 2px lines (`variant: 'area'` for a single series), crosshair tooltip listing every series, legend with the latest value. |
| `CategoryBarChart` | Magnitude by category: horizontal (default) or vertical; single series = one color + value at the bar tip; multi-series grouped or `stacked` (2px surface gap). |
| `ShareBar` | Part-to-whole in one 100% bar (≤ 8 segments) + legend with value and %. **Use instead of pie/donut.** |
| `StatTile`, `KpiRow` | Headline numbers with an optional delta (`positiveIsGood` decides green/red) and hint. |
| `ChartCard`, `ChartTable` | Card shell with the chart ↔ table toggle; the table is the accessible view of every chart. |
| `ChartLegend`, `ChartTooltipContent` | Identity (≥ 2 series) and the tooltip (value first, series second, line key). |
| `ReportRangeFilter`, `useReportRange(storageKey)` | Range presets; the chosen range is remembered per page in `localStorage`. |

## 3. Config shapes

```js
// KPI
{ id, label, value /* number (auto-compact) or preformatted string like '63%' */,
  delta /* signed % vs previous period, or null */, positiveIsGood /* default true */, hint, icon }

// Chart
{
  id, title, description, size: 'normal' | 'wide',
  type: 'timeseries' | 'bar' | 'share',
  data,                 // timeseries: [{ date: 'YYYY-MM-DD', [seriesKey]: n }] · bar/share: [{ key, label, value, colorIndex? }]
  series,               // timeseries (required) and multi-series bars: [{ key, label, colorIndex? }]
  options,              // passed to the chart: { variant, orientation, stacked, height }
  valueLabel,           // column title of the single value in the table view
  emptyText,
}
```

## 4. Data helpers (`reportUtils.js`, pure, tested)

| Helper | What it does |
|---|---|
| `REPORT_RANGES`, `DEFAULT_REPORT_RANGE` | `['7d','30d','90d','365d','all']`, default `30d`. |
| `getRangeStart(range, now)` | Local midnight of the first included day (null for `all`). |
| `filterByRange(items, getDate, range, now)` | Items inside the range. |
| `filterPreviousRange(items, getDate, range, now)` | The window just before, same length — for deltas. |
| `buildDailySeries(items, getDate, { range, getSeries, seriesKeys })` | Zero-filled daily counts, optionally split by a series key. `all` starts at the oldest item (max 365 days). |
| `countBy(items, getKey, { limit })` | Counts per key, biggest first; empty keys → `__none__`; past 8 rows the tail folds into `__other__`. |
| `percentOf`, `percentChange`, `formatCompactNumber` | Safe percents; locale-aware 1,284 / 12.9K. |

Areas translate the special keys themselves: `__none__` → `t('reports.none')`, `__other__` → `t('reports.other')`
and set `colorIndex: -1` on the "Other" row so it gets the neutral color.

## 5. Color and marks (from the dataviz method)

- **8 categorical slots** `--chart-1 … --chart-8` in `src/index.css`, light and dark defined separately, validated
  with the dataviz palette validator against the app surfaces (`#FFFFFF` light, `#0D1425` dark): adjacent CVD
  ΔE ≥ 8.4, normal-vision ΔE ≥ 19.3. Slots 3–5 are below 3:1 on white → every chart ships a legend and a table view.
- Slots are assigned in **fixed order** and follow the entity (pass `colorIndex` when a series set can change).
  **Never a 9th hue**: `getSeriesColor(i ≥ 8)` returns `--chart-other` (neutral), and `countBy` folds the tail.
- One series → one color for every bar (no value ramps on nominal categories).
- **No dual axes**, no pies/donuts (use `ShareBar`), thin bars (18px) with a 4px rounded data end, 2px lines,
  hairline recessive grid (`--chart-grid`), text always in text tokens (never the series color).
- Tooltips enhance, never gate: every value is also in the table view.

## 6. RTL / LTR, theme

- Charts render in an LTR box and flip the category/time axis with `reversed` in RTL; the value axis moves to the
  start side. Numbers stay LTR.
- All colors are CSS variables → dark mode works without code changes.

## 7. Current consumers (2026-10-01)

| Area | Route | Report hook (business logic) |
|---|---|---|
| Leads Center | `/LeadsCenter/reports` | `features/customers/reports` (`useLeadsCenterReport`, `buildLeadsReport`) |
| Calls / Meetings | `/calls/reports`, `/meetings/reports` | `features/communication/reports/useActivityReport` |
| Conversations | `/conversations/reports` | `features/communication/reports/useConversationsReport` |
| Team chat | `/team-chat/reports` | `features/communication/reports/useTeamChatReport` |
| Products & services | `/products/reports` | `features/products/reports` (`useProductsReport`, `flattenCatalog`) |
| Playground | `/playground/reports` | fixture in `pages/playground/ReportsDemo.jsx` |

**Not migrated yet** (they have their own analytics pages; move their charts here when they are next touched):
Customer Hub reports (`features/service/reports`, its `TrendChart` already follows the same rules), Outreach overview,
Social Media analytics, Campaign Center analytics. Settings has no Reports page (configuration only).

## 8. Add a Reports page to an area

1. In the owning feature, write a pure model (records → numbers) with a test, and a hook
   `use<Area>Report(range)` that returns `{ kpis, charts, recordCount, isLoading, error, refetch }` using the helpers
   above. Put labels through `t()`; never translate backend values.
2. Add a thin page:
   ```jsx
   const [range, setRange] = useReportRange('reports:<area>')
   const report = use<Area>Report(range)
   return <ReportsPage title={…} description={…} range={range} onRangeChange={setRange} {...report}
                       onRetry={report.refetch} note={t('reports.basedOnRecords', { count: report.recordCount })} />
   ```
3. Add the route and a **"Reports & statistics"** item (`BarChart3` icon) to the area's sub-sidebar config.
4. Update the area's doc and this README's §7 with a timestamp, and add a change-log row in `docs/README.md`.

## 9. Known gaps

- Most areas compute reports in the browser from what the list endpoints return (first pages); every page says how
  many records it used. Move to backend aggregates when they exist — only the area hook changes.
- No export (CSV/PDF) and no custom date range yet (presets only).
- Texture fill for full CVD/print is not implemented (legend + table view are the current relief).

## 10. Change log

| When | Change |
|---|---|
| 2026-10-01 01:49 (Africa/Cairo) | Engine created (page, charts, KPI, range, helpers, tests, playground); 8 validated chart tokens; Leads Center, Communication ×4 and Products reports pages. |
