import { unwrapEntity, unwrapList } from '../hooks/dealResponse'

/**
 * Backend deal analytics (Postman "Deal Analytics", 2026-10-16), normalized for the UI. Pure.
 *
 * `GET /deals/{id}/analytics/overview` → `{ data: { deal, stats, stages_summary } }`
 *   stats: `{ total_leads, won, lost, open, revenue, achievement_percentage }` — `achievement_percentage` is already a
 *   percent (580 of 500,000 → 0.12), so it is shown as "0.12%", never multiplied by 100.
 *   stages_summary: `[{ id, name, leads_count }]` — also the "funnel" (the collection's funnel request is this URL).
 * `GET /deals/{id}/analytics/owners` → `{ data: [{ owner_id, leads_count, revenue, won_count, owner: { name, email } }] }`
 *   (numbers may come as strings: "580.00", "2").
 */

const num = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}
const numOrNull = (value) => (value === null || value === undefined || value === '' || !Number.isFinite(Number(value)) ? null : Number(value))
const percent = (part, whole) => (whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0)
const day = (value) => (value ? String(value).slice(0, 10) : '')

export function normalizeDealOverview(response) {
  const data = unwrapEntity(response, 'overview')
  if (!data) return null
  const deal = data.deal || {}
  const stats = data.stats || {}
  const won = num(stats.won)
  const lost = num(stats.lost)
  const total = num(stats.total_leads)
  const targetRevenue = numOrNull(deal.target_revenue)
  const targetLeads = numOrNull(deal.target_leads)
  const revenue = num(stats.revenue)
  return {
    deal: { name: deal.name || '', status: deal.status || '', startDate: day(deal.start_date), endDate: day(deal.end_date), targetRevenue, targetLeads },
    stats: {
      total,
      won,
      lost,
      open: num(stats.open),
      revenue,
      achievement: numOrNull(stats.achievement_percentage) ?? (targetRevenue ? percent(revenue, targetRevenue) : null),
      winRate: percent(won, won + lost),
      leadsProgress: targetLeads ? percent(total, targetLeads) : null,
    },
    stages: (Array.isArray(data.stages_summary) ? data.stages_summary : []).map((stage) => ({ id: String(stage.id), name: stage.name || `#${stage.id}`, count: num(stage.leads_count) })),
  }
}

export function normalizeDealOwners(response) {
  return unwrapList(response, ['owners'])
    .map((row) => {
      const leads = num(row.leads_count)
      const won = num(row.won_count)
      return {
        id: String(row.owner_id ?? row.owner?.id ?? ''),
        name: row.owner?.name || row.owner_name || (row.owner_id ? `#${row.owner_id}` : ''),
        email: row.owner?.email || '',
        leads,
        won,
        revenue: num(row.revenue),
        winRate: percent(won, leads),
      }
    })
    .sort((left, right) => right.revenue - left.revenue || right.won - left.won || right.leads - left.leads)
}

/** Time of the deal: `{ elapsedPercent, daysLeft, totalDays }`, or null without both dates. */
export function dealTimeProgress(startDate, endDate, now = new Date()) {
  const start = startDate ? new Date(`${day(startDate)}T00:00:00`) : null
  const end = endDate ? new Date(`${day(endDate)}T23:59:59`) : null
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return null
  const dayMs = 86400000
  const totalDays = Math.max(1, Math.round((end - start) / dayMs))
  const elapsed = Math.min(Math.max(now - start, 0), end - start)
  return { elapsedPercent: Math.round((elapsed / (end - start)) * 100), daysLeft: Math.max(0, Math.ceil((end - now) / dayMs)), totalDays }
}

/** One row per open deal for the compare view. `items`: `[{ dealId, name, overview }]` (overview may be null). */
export function buildDealsComparison(items = []) {
  return items.map(({ dealId, name, overview }) => ({
    dealId: String(dealId),
    name: overview?.deal.name || name || `#${dealId}`,
    loaded: Boolean(overview),
    ...(overview ? overview.stats : { total: null, won: null, lost: null, open: null, revenue: null, achievement: null, winRate: null, leadsProgress: null }),
    targetRevenue: overview?.deal.targetRevenue ?? null,
    targetLeads: overview?.deal.targetLeads ?? null,
  }))
}
