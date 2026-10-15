/**
 * How complete a deal's setup is (2026-10-16): a checklist, scored as done / known items. Pure.
 *
 * Items: description, period (both dates), lead target, revenue target, owner, stages (pipeline template),
 * products, team, leads. Products / team / leads come from the quick info and may be unknown (`null`) for deals
 * past the quick-info limit — unknown items are left out of the score and reported in `unknown`.
 */
export const COMPLETENESS_ITEMS = ['description', 'period', 'targetLeads', 'targetRevenue', 'owner', 'stages', 'products', 'team', 'leads']

const filled = (value) => value !== null && value !== undefined && String(value).trim() !== ''
const positive = (value) => filled(value) && Number(value) > 0

export function buildDealCompleteness(deal = {}, { productsCount = null, teamCount = null, leadsCount = null } = {}) {
  const checks = {
    description: filled(deal.description),
    period: filled(deal.start_date) && filled(deal.end_date),
    targetLeads: positive(deal.target_leads),
    targetRevenue: positive(deal.target_revenue),
    owner: filled(deal.owner_id) || filled(deal.owner?.id),
    stages: filled(deal.pipeline_template_id) || (Array.isArray(deal.stages) && deal.stages.length > 0),
    products: productsCount === null ? null : productsCount > 0,
    team: teamCount === null ? null : teamCount > 0,
    leads: leadsCount === null ? null : leadsCount > 0,
  }
  const items = COMPLETENESS_ITEMS.map((id) => ({ id, done: checks[id] }))
  const known = items.filter((item) => item.done !== null)
  const done = known.filter((item) => item.done).length
  return {
    score: known.length ? Math.round((done / known.length) * 100) : 0,
    done,
    total: known.length,
    items,
    missing: items.filter((item) => item.done === false).map((item) => item.id),
    unknown: items.filter((item) => item.done === null).map((item) => item.id),
  }
}

/** Tone of a score for colors: `low` < 50 ≤ `mid` < 100 = `full`. */
export const completenessTone = (score) => (score >= 100 ? 'full' : score >= 50 ? 'mid' : 'low')
