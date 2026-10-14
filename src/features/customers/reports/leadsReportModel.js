/**
 * Pure model of the Leads Center report (added 2026-10-01). Reads the customer row shape the
 * Leads Center table uses (`customer.lead.*`) and turns it into KPI numbers and chart data for the
 * shared reports engine. No React, no i18n: labels for special keys are resolved by the hook.
 */
import { buildDailySeries, countBy, filterByRange, filterPreviousRange, percentChange } from '../../../shared/components/reports'

const lead = (customer) => customer?.lead || {}

export function getLeadCreatedAt(customer) {
  return customer?.created_at || customer?.createdAt || lead(customer).created_at || null
}

export function getLeadStatusName(customer) {
  const status = lead(customer).status ?? customer?.status
  if (status && typeof status === 'object') return status.name || status.status || status.title || ''
  return lead(customer).status_name || status || ''
}

export function getLeadSource(customer) {
  const source = lead(customer).source ?? customer?.source
  if (source && typeof source === 'object') return source.name || source.type || ''
  return source || ''
}

export function getLeadAssigneeId(customer) {
  const value = lead(customer).assigned_to ?? customer?.assigned_to
  if (value && typeof value === 'object') return value.id ?? ''
  return value ?? ''
}

/**
 * @returns {{ total, created, previousCreated, createdDelta, unassigned, dailyCreated, byStatus, bySource, byAssignee }}
 *   Category rows use raw keys; '__none__' = not set, '__other__' = folded tail.
 */
export function buildLeadsReport(customers = [], range, now = new Date()) {
  const inRange = filterByRange(customers, getLeadCreatedAt, range, now)
  const previous = filterPreviousRange(customers, getLeadCreatedAt, range, now)

  return {
    total: customers.length,
    created: inRange.length,
    previousCreated: previous.length,
    createdDelta: range === 'all' ? null : percentChange(inRange.length, previous.length),
    unassigned: inRange.filter((customer) => !getLeadAssigneeId(customer)).length,
    dailyCreated: buildDailySeries(customers, getLeadCreatedAt, { range, now }),
    byStatus: countBy(inRange, getLeadStatusName),
    bySource: countBy(inRange, getLeadSource),
    byAssignee: countBy(inRange, getLeadAssigneeId),
  }
}
