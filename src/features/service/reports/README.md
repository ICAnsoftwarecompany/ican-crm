# features/service/reports — Reports dashboard (F2)

`/service/reports?tab=overview|feedback&period=7d|30d|90d`. The **server aggregates**; the UI only
renders `GET /service/reports/overview?period=` (spec §51 `/service/reports/{report_key}`).

| Path | Role |
|---|---|
| `api/reportsApi.js` | `useReportOverview(period)`, `REPORT_PERIODS`. |
| `components/ReportsWorkspace.jsx` | Tabs + period control (one row), state in the URL. |
| `components/ReportsOverview.jsx` | KPI tiles, trend, rating distribution, by type / channel / agent. |
| `components/KpiTiles.jsx` | Headline figures (stat tiles, not charts); SLA compliance toned with `--sla-*`. |
| `components/TrendChart.jsx` | Recharts line chart: new vs resolved, one y-axis, legend + end values, hover tooltip, table view. |
| `components/BarList.jsx` | HTML magnitude bars for small categorical breakdowns (single hue). |

Response: `{ period: {key, from, to}, kpis: { created, resolved, open_now, avg_first_response_minutes,
avg_resolution_minutes, sla_compliance_percent, reopened }, csat: { count, average, satisfied_percent,
distribution: [{score, count}] }, sla: { met, breached }, trend: [{ date, created, resolved }] (daily ≤ 30d,
weekly for 90d), by_type: [{ type: {id,key,label}, count }], by_channel: [{ channel, count }],
by_agent: [{ agent: {id,name}, resolved, avg_resolution_minutes, csat_average }] }`. Missing values are `null`.

Chart colors: `--chart-1` / `--chart-2` in `src/index.css` (light + dark), validated for color-vision
deficiency against `--surface` with the dataviz palette validator. Add a series → take the next validated
slot, never a status color. Charts render `dir="ltr"` with the x-axis reversed in RTL.
