/**
 * Pure model of one deal's Reports page (shared reports engine). Input: the deal's normalized leads
 * (features/deals/utils/dealLeads) and its normalized contracts. Created = `createdAt`, closed = `closedAt`.
 */
import { buildDailySeries, countBy, filterByRange, filterPreviousRange, percentChange, percentOf } from '../../../shared/components/reports'

const created = (lead) => lead.createdAt
const closed = (lead) => lead.closedAt

export function buildDealReport({ leads = [], contracts = [], stages = [], range, now = new Date() }) {
  const createdNow = filterByRange(leads, created, range, now)
  const createdBefore = filterPreviousRange(leads, created, range, now)
  const closedNow = filterByRange(leads.filter((lead) => lead.status !== 'open'), closed, range, now)
  const wonNow = closedNow.filter((lead) => lead.status === 'won')
  const lostNow = closedNow.filter((lead) => lead.status === 'lost')
  const wonBefore = filterPreviousRange(leads.filter((lead) => lead.status === 'won'), closed, range, now)
  const contractsNow = filterByRange(contracts, (contract) => contract.signedAt, range, now)
  const stageIndex = new Map(stages.map((stage, index) => [String(stage.id), index]))

  const byStage = stages.map((stage) => ({
    key: String(stage.id),
    value: leads.filter((lead) => lead.status === 'open' && String(lead.stageId) === String(stage.id)).length,
  }))

  return {
    created: createdNow.length,
    createdDelta: range === 'all' ? null : percentChange(createdNow.length, createdBefore.length),
    won: wonNow.length,
    wonDelta: range === 'all' ? null : percentChange(wonNow.length, wonBefore.length),
    lost: lostNow.length,
    winRate: percentOf(wonNow.length, wonNow.length + lostNow.length),
    revenue: contractsNow.reduce((sum, contract) => sum + contract.total, 0),
    pipelineValue: leads.filter((lead) => lead.status === 'open').reduce((sum, lead) => sum + lead.estimatedValue, 0),
    openCount: leads.filter((lead) => lead.status === 'open').length,
    dailyCreated: buildDailySeries(leads, created, { range, now }),
    dailyClosed: buildDailySeries(closedNow, closed, { range, now, getSeries: (lead) => lead.status, seriesKeys: ['won', 'lost'] }),
    byStage,
    stageIndex,
    bySource: countBy(createdNow, (lead) => lead.source),
    byOwner: countBy(leads.filter((lead) => lead.status === 'open'), (lead) => lead.ownerId),
    lostReasons: countBy(lostNow, (lead) => lead.lostReason),
    byStatus: ['open', 'won', 'lost'].map((status) => ({ key: status, value: leads.filter((lead) => lead.status === status).length })),
  }
}

/** Hub report (all deals of the tenant): from the deals list. */
export function buildDealsHubReport({ deals = [], contracts = [], range, now = new Date() }) {
  const createdNow = filterByRange(deals, (deal) => deal.created_at, range, now)
  const createdBefore = filterPreviousRange(deals, (deal) => deal.created_at, range, now)
  const contractsNow = filterByRange(contracts, (contract) => contract.signedAt, range, now)
  return {
    total: deals.length,
    active: deals.filter((deal) => deal.statusValue === 'active').length,
    created: createdNow.length,
    createdDelta: range === 'all' ? null : percentChange(createdNow.length, createdBefore.length),
    contracts: contractsNow.length,
    revenue: contractsNow.reduce((sum, contract) => sum + contract.total, 0),
    targetRevenue: deals.reduce((sum, deal) => sum + (Number(deal.target_revenue) || 0), 0),
    byStatus: countBy(deals, (deal) => deal.statusValue),
    byType: countBy(deals, (deal) => deal.type),
    contractsByDeal: countBy(contractsNow, (contract) => contract.dealId),
    dailyContracts: buildDailySeries(contracts, (contract) => contract.signedAt, { range, now }),
  }
}
