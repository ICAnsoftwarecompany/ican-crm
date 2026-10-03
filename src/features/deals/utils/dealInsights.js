import { isDealLeadStale } from './dealLeads'
import { isInstallmentOverdue } from './dealContracts'
import { progressPercent, toAmount } from './dealMoney'

/**
 * Rule-based hints for the deal (overview alerts + assistant page). These are plain rules computed from
 * data already on screen — NOT AI. Each hint: `{ id, severity: 'high'|'medium'|'low', count, action }`
 * where `action` is a workspace page + optional query (the page applies it as a filter).
 */
export function buildDealInsights({ deal, leads = [], contracts = [], now = new Date() }) {
  const insights = []
  const open = leads.filter((lead) => lead.status === 'open')

  const unassigned = open.filter((lead) => !lead.ownerId).length
  if (unassigned) insights.push({ id: 'unassignedLeads', severity: 'high', count: unassigned, action: { page: 'pipeline', query: 'filter=unassigned&view=table' } })

  const stale = open.filter((lead) => isDealLeadStale(lead, now)).length
  if (stale) insights.push({ id: 'staleLeads', severity: 'medium', count: stale, action: { page: 'pipeline', query: 'filter=stale&view=table' } })

  const overdue = contracts.flatMap((contract) => contract.installments || []).filter((row) => isInstallmentOverdue(row, now)).length
  if (overdue) insights.push({ id: 'overdueInstallments', severity: 'high', count: overdue, action: { page: 'contracts', query: 'filter=overdue' } })

  const noValue = open.filter((lead) => !lead.estimatedValue).length
  if (noValue && open.length) insights.push({ id: 'leadsWithoutValue', severity: 'low', count: noValue, action: { page: 'pipeline', query: 'view=table' } })

  const pace = buildTargetPace(deal, leads, now)
  if (pace && pace.behind) insights.push({ id: 'behindTarget', severity: 'medium', count: pace.gap, action: { page: 'reports' } })

  if (!leads.length) insights.push({ id: 'noLeads', severity: 'low', count: 0, action: { page: 'pipeline', query: 'add=1' } })

  const rank = { high: 0, medium: 1, low: 2 }
  return insights.sort((left, right) => rank[left.severity] - rank[right.severity])
}

/**
 * Revenue pace vs the deal's target: how much of the period has passed vs how much of the target is won.
 * `{ elapsedPercent, achievedPercent, behind, gap }` (gap in percentage points) or null without dates/target.
 */
export function buildTargetPace(deal, leads = [], now = new Date()) {
  const target = toAmount(deal?.target_revenue)
  const start = deal?.start_date ? new Date(`${String(deal.start_date).slice(0, 10)}T00:00:00`) : null
  const end = deal?.end_date ? new Date(`${String(deal.end_date).slice(0, 10)}T23:59:59`) : null
  if (!target || !start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return null
  const elapsed = Math.min(Math.max((now - start) / (end - start), 0), 1)
  const won = leads.filter((lead) => lead.status === 'won').reduce((sum, lead) => sum + lead.estimatedValue, 0)
  const achievedPercent = progressPercent(won, target) ?? 0
  const elapsedPercent = Math.round(elapsed * 100)
  const gap = elapsedPercent - achievedPercent
  return { elapsedPercent, achievedPercent, behind: gap >= 15, gap: Math.max(gap, 0) }
}
