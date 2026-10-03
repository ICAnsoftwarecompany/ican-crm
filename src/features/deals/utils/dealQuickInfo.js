import { resolveDealProductMode } from './dealProductMode'

/**
 * Quick info of one deal for the hub (`/deals` table + board): does it have products (and which work
 * template), a team, and what was the last action inside it.
 *
 * The list endpoint may already carry these (proposed in spec §9.11: `products_count`, `team_count`,
 * `last_activity`). When it does, nothing else is fetched; otherwise the hub reads the deal's team, products
 * and leads (same cache as the workspace) and derives them here.
 */

const isPresent = (value) => value !== undefined && value !== null && value !== ''
const countOf = (...values) => {
  for (const value of values) {
    if (Array.isArray(value)) return value.length
    if (isPresent(value) && Number.isFinite(Number(value))) return Number(value)
  }
  return null
}
const time = (value) => {
  if (!isPresent(value)) return null
  const parsed = new Date(value).getTime()
  return Number.isNaN(parsed) ? null : parsed
}

/** What the list row already says (null = unknown, fetch it). */
export function readListSummary(deal = {}) {
  const backend = deal.last_activity || deal.latest_activity || deal.last_action || null
  return {
    productsCount: countOf(deal.products_count, deal.deal_products_count, deal.products),
    products: Array.isArray(deal.products) ? deal.products.map((row) => row?.product || row) : null,
    teamCount: countOf(deal.team_count, deal.team_members_count, deal.deal_team_count, deal.team),
    lastAction: backend ? normalizeBackendAction(backend) : null,
  }
}

function normalizeBackendAction(entry) {
  if (typeof entry === 'string') return { type: 'backend', at: null, text: entry }
  const at = entry.created_at ?? entry.at ?? entry.date ?? null
  return {
    type: 'backend',
    at,
    text: entry.description ?? entry.text ?? entry.action ?? entry.event ?? '',
    by: entry.causer?.name ?? entry.user?.name ?? entry.by ?? '',
  }
}

/**
 * Latest thing that happened in the deal, from its (normalized) leads and its own dates:
 * a lead won / lost / added / touched, else the deal updated / created. Returns null when nothing is dated.
 */
export function resolveLastAction(deal = {}, leads = []) {
  const events = []
  const push = (type, at, name = '') => {
    const stamp = time(at)
    if (stamp !== null) events.push({ type, at, stamp, name })
  }
  leads.forEach((lead) => {
    if (lead.status === 'won') push('leadWon', lead.won_at ?? lead.closedAt, lead.name)
    if (lead.status === 'lost') push('leadLost', lead.lost_at ?? lead.closedAt, lead.name)
    push('leadAdded', lead.createdAt ?? lead.created_at, lead.name)
    const touched = lead.last_activity_at ?? lead.updated_at
    if (touched && time(touched) !== time(lead.createdAt ?? lead.created_at)) push('leadActivity', touched, lead.name)
  })
  push('dealCreated', deal.created_at)
  if (deal.updated_at && time(deal.updated_at) !== time(deal.created_at)) push('dealUpdated', deal.updated_at)
  if (!events.length) return null
  // Latest first; on a tie a closing (won/lost) beats "activity" so the card says the meaningful thing.
  const weight = { leadWon: 5, leadLost: 5, leadAdded: 3, leadActivity: 2, dealUpdated: 1, dealCreated: 0 }
  events.sort((left, right) => right.stamp - left.stamp || weight[right.type] - weight[left.type])
  const { type, at, name } = events[0]
  return { type, at, name }
}

/**
 * `{ productsCount, productMode, teamCount, lastAction, isComplete }` — the list row wins over fetched data.
 * `products`/`team`/`leads` are null while not loaded (then the matching value stays null = "loading").
 */
export function buildDealQuickInfo({ deal = {}, products = null, team = null, leads = null }) {
  const summary = readListSummary(deal)
  const productRows = summary.products || products
  const productsCount = summary.productsCount ?? (products ? products.length : null)
  const teamCount = summary.teamCount ?? (team ? team.length : null)
  const lastAction = summary.lastAction ?? (leads ? resolveLastAction(deal, leads) : null)
  return {
    productsCount,
    productMode: productRows ? resolveDealProductMode(productRows) : productsCount === 0 ? 'open' : productsCount > 1 ? 'multi_product' : null,
    teamCount,
    lastAction,
    hasProducts: productsCount === null ? null : productsCount > 0,
    hasTeam: teamCount === null ? null : teamCount > 0,
  }
}

/** What still has to be fetched for this row (nothing when the list endpoint already sends the summary). */
export function getMissingQuickInfo(deal = {}) {
  const summary = readListSummary(deal)
  return {
    products: summary.products === null,
    team: summary.teamCount === null,
    leads: summary.lastAction === null,
  }
}

/** Counts for the hub report: deals with no products, no team, or both set up. Unknown rows are skipped. */
export function summarizeDealsSetup(infos = []) {
  return infos.reduce((result, info) => {
    if (info.hasProducts === null || info.hasTeam === null) return result
    if (info.hasProducts && info.hasTeam) result.ready += 1
    if (!info.hasProducts) result.noProducts += 1
    if (!info.hasTeam) result.noTeam += 1
    return result
  }, { ready: 0, noProducts: 0, noTeam: 0 })
}
