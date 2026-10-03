/**
 * Calendar events that only exist in a deal: contract installments and the deal's start/end dates.
 * Same event shape as features/calendar adapters: `{ id, sourceId, title, start, end, allDay, raw }`.
 */
export const DEAL_CALENDAR_SOURCES = [
  { id: 'installments', labelKey: 'dealWorkspace.calendar.sources.installments', colorVar: '--calendar-deals' },
  { id: 'milestones', labelKey: 'dealWorkspace.calendar.sources.milestones', colorVar: '--calendar-social' },
]

const toDate = (value) => {
  if (!value) return null
  const date = new Date(`${String(value).slice(0, 10)}T09:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

export function buildInstallmentEvents(contracts = [], labels = {}) {
  return contracts.flatMap((contract) => (contract.installments || []).map((installment) => {
    const start = toDate(installment.dueDate)
    if (!start) return null
    return {
      id: `installment-${contract.id}-${installment.number}`,
      sourceId: 'installments',
      title: `${labels.installment || '#'} ${installment.number} · ${contract.number}`,
      start,
      end: start,
      allDay: true,
      status: installment.status,
      rawId: contract.id,
      raw: { kind: 'installment', contract, installment },
    }
  }).filter(Boolean))
}

export function buildDealMilestoneEvents(deal, labels = {}) {
  if (!deal) return []
  return [['start_date', 'start'], ['end_date', 'end']].map(([field, key]) => {
    const start = toDate(deal[field])
    if (!start) return null
    return {
      id: `deal-${deal.id}-${key}`,
      sourceId: 'milestones',
      title: `${labels[key] || key} · ${deal.name || ''}`,
      start,
      end: start,
      allDay: true,
      rawId: deal.id,
      raw: { kind: 'milestone', deal, field },
    }
  }).filter(Boolean)
}
