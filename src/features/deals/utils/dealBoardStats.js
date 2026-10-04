import { isDealLeadStale } from './dealLeads'
import { progressPercent, toAmount } from './dealMoney'

/**
 * Numbers behind a deal card on the hub board (`/deals?view=board`), from the deal row and its normalized
 * leads (same cached list as the workspace). `leads === null` = not loaded yet: lead numbers stay null and
 * the card shows the target only. Won revenue = sum of the won leads' estimated value (same rule as
 * `buildTargetPace`); the backend's contracts stay the real revenue.
 */

const DAY = 24 * 60 * 60 * 1000
const CLOSED_STATUSES = new Set(['completed', 'cancelled'])

const parseDay = (value, endOfDay = false) => {
  if (!value) return null
  const date = new Date(`${String(value).slice(0, 10)}T${endOfDay ? '23:59:59' : '00:00:00'}`)
  return Number.isNaN(date.getTime()) ? null : date
}

/** `{ phase: 'upcoming'|'running'|'ended', days, elapsedPercent }` or null without dates. */
export function resolveDealTiming(deal = {}, now = new Date()) {
  const start = parseDay(deal.start_date)
  const end = parseDay(deal.end_date, true)
  if (!start && !end) return null
  if (start && now < start) return { phase: 'upcoming', days: Math.ceil((start - now) / DAY), elapsedPercent: 0 }
  if (end && now > end) return { phase: 'ended', days: Math.floor((now - end) / DAY), elapsedPercent: 100 }
  const elapsedPercent = start && end && end > start ? Math.round(((now - start) / (end - start)) * 100) : null
  return { phase: 'running', days: end ? Math.ceil((end - now) / DAY) : null, elapsedPercent }
}

/**
 * Health of an active deal: what is achieved (revenue target, else leads target) against how much of the
 * period has passed. `onTrack | behind | atRisk`, or null when it cannot be judged (closed/draft deal,
 * leads not loaded, no target, no period).
 */
export function resolveDealHealth({ status, achievedPercent, timing }) {
  if (status !== 'active' || achievedPercent === null || !timing || timing.phase === 'upcoming') return null
  if (timing.phase === 'ended') return achievedPercent >= 100 ? 'onTrack' : 'atRisk'
  if (timing.elapsedPercent === null) return null
  const gap = timing.elapsedPercent - achievedPercent
  if (gap >= 30) return 'atRisk'
  if (gap >= 15) return 'behind'
  return 'onTrack'
}

export function buildDealCardStats({ deal = {}, leads = null, now = new Date() }) {
  const timing = resolveDealTiming(deal, now)
  const status = deal.statusValue ?? ''
  const targetRevenue = toAmount(deal.target_revenue) || null
  const targetLeads = toAmount(deal.target_leads) || null
  const listCount = Number(deal.leadsCount ?? deal.leads_count ?? 0) || 0

  if (!Array.isArray(leads)) {
    return {
      loaded: false, timing, targetRevenue, targetLeads,
      leads: { total: listCount, open: null, won: null, lost: null },
      wonRevenue: null, openValue: null, revenuePercent: null,
      leadsPercent: progressPercent(listCount, targetLeads), winRate: null,
      unassigned: 0, stale: 0, health: null,
    }
  }

  const counts = { total: leads.length, open: 0, won: 0, lost: 0 }
  let wonRevenue = 0
  let openValue = 0
  let unassigned = 0
  let stale = 0
  leads.forEach((lead) => {
    counts[lead.status] = (counts[lead.status] || 0) + 1
    if (lead.status === 'won') wonRevenue += toAmount(lead.estimatedValue)
    if (lead.status === 'open') {
      openValue += toAmount(lead.estimatedValue)
      if (!lead.ownerId) unassigned += 1
      if (isDealLeadStale(lead, now)) stale += 1
    }
  })
  const closed = counts.won + counts.lost
  const revenuePercent = progressPercent(wonRevenue, targetRevenue)
  const leadsPercent = progressPercent(counts.total, targetLeads)
  const achievedPercent = revenuePercent ?? (targetLeads ? progressPercent(counts.won, targetLeads) : null)
  return {
    loaded: true, timing, targetRevenue, targetLeads,
    leads: counts,
    wonRevenue, openValue, revenuePercent, leadsPercent,
    winRate: closed ? Math.round((counts.won / closed) * 100) : null,
    unassigned, stale,
    health: CLOSED_STATUSES.has(status) ? null : resolveDealHealth({ status, achievedPercent, timing }),
  }
}

/** Column header totals: number of deals, sum of revenue targets, won revenue (null while nothing is loaded). */
export function summarizeDealColumn(stats = []) {
  return stats.reduce((result, entry) => {
    result.count += 1
    result.targetRevenue += entry.targetRevenue || 0
    if (entry.wonRevenue !== null) result.wonRevenue = (result.wonRevenue || 0) + entry.wonRevenue
    if (entry.health === 'atRisk' || entry.health === 'behind') result.attention += 1
    return result
  }, { count: 0, targetRevenue: 0, wonRevenue: null, attention: 0 })
}

/** Board sort orders. Undated / unknown values go last. */
export const DEAL_BOARD_SORTS = ['newest', 'endingSoon', 'revenue', 'progress']

export function sortDealsForBoard(deals = [], statsById = new Map(), sort = 'newest') {
  if (sort === 'newest') return deals
  const value = (deal) => {
    const stats = statsById.get(String(deal.id))
    if (sort === 'endingSoon') return stats?.timing?.phase === 'running' && stats.timing.days !== null ? stats.timing.days : Infinity
    if (sort === 'revenue') return -(toAmount(deal.target_revenue))
    return -(stats?.revenuePercent ?? stats?.leadsPercent ?? -1)
  }
  return [...deals].sort((left, right) => value(left) - value(right))
}
