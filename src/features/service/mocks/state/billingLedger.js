/**
 * Mock of the server-side Billing Lite ledger (spec §29.10–29.13). Pure functions over a stored
 * schedule `{ id, lines[], payments[], promises[], plan_snapshot, … }`; `today` is injected so tests are
 * deterministic. The real server runs late fees as a daily job — here they are derived on read.
 */
import { addPeriod, parsePeriod } from './paymentPlanEngine'

const DAY_MS = 24 * 60 * 60 * 1000
const round = (value) => Math.round(value * 100) / 100
export const todayIso = () => new Date().toISOString().slice(0, 10)
const daysBetween = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS)

export const AGING_BUCKETS = ['1_30', '31_60', '61_90', '90_plus']
export const bucketOf = (days) => (days <= 30 ? '1_30' : days <= 60 ? '31_60' : days <= 90 ? '61_90' : '90_plus')

/** Late fee owed on a line today (spec §29.12): % per started month after grace, capped, never below what was paid. */
function lateFeeOf(line, config, today) {
  const paidFee = line.fee_paid || 0
  if (line.fee_waived) return paidFee
  const remaining = line.amount - (line.paid_amount || 0) - (line.settled_discount || 0)
  const overdue = line.due_date ? daysBetween(line.due_date, today) : 0
  const grace = Number(config?.grace_days) || 0
  const rate = Number(config?.late_fee?.value) || 0
  if (remaining <= 0.005 || overdue <= grace || !rate) return paidFee
  const months = Math.ceil((overdue - grace) / 30)
  const cap = config.late_fee.cap_percent != null ? (line.amount * Number(config.late_fee.cap_percent)) / 100 : Infinity
  return Math.max(paidFee, round(Math.min((remaining * rate * months) / 100, cap)))
}

/** Derived state of one line: status (upcoming|due|partially_paid|paid|overdue|waived|cancelled), remaining, fee. */
export function lineState(line, schedule, today = todayIso()) {
  const paid = line.paid_amount || 0
  // `settled_discount` = unearned interest / payoff discount forgiven by an early payoff settlement.
  const remaining = round(Math.max(line.amount - paid - (line.settled_discount || 0), 0))
  const lateFee = lateFeeOf(line, schedule.plan_snapshot, today)
  const feeOutstanding = round(Math.max(lateFee - (line.fee_paid || 0), 0))
  const daysOverdue = line.due_date ? Math.max(daysBetween(line.due_date, today), 0) : 0
  let status
  if (line.cancelled) status = 'cancelled'
  else if (remaining <= 0.005) status = line.waived ? 'waived' : 'paid'
  else if (['cancelled', 'rescheduled', 'transferred'].includes(schedule.status)) status = 'cancelled'
  else if (line.due_date && line.due_date < today) status = 'overdue'
  else if (line.due_date === today) status = paid > 0 ? 'partially_paid' : 'due'
  else status = paid > 0 ? 'partially_paid' : 'upcoming'
  return {
    ...line,
    paid_amount: round(paid),
    remaining: status === 'cancelled' ? 0 : remaining,
    late_fee_amount: lateFee,
    fee_outstanding: status === 'cancelled' ? 0 : feeOutstanding,
    days_overdue: status === 'overdue' ? daysOverdue : 0,
    status,
  }
}

/**
 * Promise-to-pay states: payments made between the promise and its date (end of day) are consumed by the
 * oldest promise first, so one payment never keeps two promises. Not covered in time → broken; else open.
 */
function promiseStates(promises, payments, today) {
  const pool = payments
    .filter((payment) => payment.status === 'confirmed' && payment.amount > 0)
    .map((payment) => ({ paid_at: payment.paid_at, left: payment.amount }))
    .sort((a, b) => a.paid_at.localeCompare(b.paid_at))
  const states = new Map()
  ;[...promises].sort((a, b) => a.created_at.localeCompare(b.created_at)).forEach((promise) => {
    let needed = promise.amount
    pool.forEach((entry) => {
      if (needed <= 0.005 || entry.left <= 0 || entry.paid_at < promise.created_at || entry.paid_at.slice(0, 10) > promise.promised_date) return
      const used = Math.min(entry.left, needed)
      entry.left -= used
      needed -= used
    })
    states.set(promise.id, needed <= 0.005 ? 'kept' : promise.promised_date < today ? 'broken' : 'open')
  })
  return promises.map((promise) => ({ ...promise, status: states.get(promise.id) }))
}

export function serializeSchedule(schedule, today = todayIso()) {
  const lines = schedule.lines.map((line) => lineState(line, schedule, today))
  const live = lines.filter((line) => line.status !== 'cancelled')
  const sum = (list, pick) => round(list.reduce((total, line) => total + pick(line), 0))
  const outstanding = sum(live, (line) => line.remaining + line.fee_outstanding)
  const overdue = live.filter((line) => line.status === 'overdue')
  const next = live.filter((line) => line.remaining > 0 && line.due_date >= today).sort((a, b) => a.due_date.localeCompare(b.due_date))[0]
  const status = schedule.status === 'active' && live.length && outstanding <= 0.005 ? 'completed' : schedule.status
  return {
    ...schedule,
    status,
    lines,
    promises: promiseStates(schedule.promises || [], schedule.payments || [], today),
    totals: {
      in_price: sum(lines.filter((line) => line.in_price), (line) => line.amount),
      outside_price: sum(lines.filter((line) => !line.in_price), (line) => line.amount),
      paid: sum(lines, (line) => line.paid_amount + (line.fee_paid || 0)),
      late_fees: sum(live, (line) => line.fee_outstanding),
      outstanding,
      overdue: sum(overdue, (line) => line.remaining + line.fee_outstanding),
    },
    overdue_lines: overdue.length,
    oldest_overdue_date: overdue[0]?.due_date || null,
    days_overdue: overdue.length ? Math.max(...overdue.map((line) => line.days_overdue)) : 0,
    next_due: next ? { date: next.due_date, amount: round(next.remaining + next.fee_outstanding) } : null,
  }
}

/**
 * Oldest-first allocation (spec §29.10): per line by due date, late fee before principal.
 * `lineId` (optional) is served first. Throws `exceeds` when the amount is above the outstanding.
 */
export function allocatePayment(schedule, amount, { lineId, today = todayIso() } = {}) {
  const lines = schedule.lines.map((line) => lineState(line, schedule, today)).filter((line) => line.status !== 'cancelled' && line.remaining + line.fee_outstanding > 0.005)
  const outstanding = round(lines.reduce((total, line) => total + line.remaining + line.fee_outstanding, 0))
  if (amount - outstanding > 0.005) return { error: 'exceeds', outstanding }
  const ordered = [...lines].sort((a, b) => (a.id === lineId ? -1 : b.id === lineId ? 1 : 0) || String(a.due_date).localeCompare(String(b.due_date)) || a.seq - b.seq)
  let left = round(amount)
  const allocations = []
  for (const line of ordered) {
    if (left <= 0.005) break
    const fee = round(Math.min(line.fee_outstanding, left))
    left = round(left - fee)
    const principal = round(Math.min(line.remaining, left))
    left = round(left - principal)
    if (fee || principal) allocations.push({ line_id: line.id, seq: line.seq, fee, principal })
  }
  return { allocations }
}

/** Applies (sign = 1) or undoes (sign = -1) allocations on the stored lines. */
export function applyAllocations(schedule, allocations, sign = 1) {
  allocations.forEach((allocation) => {
    const line = schedule.lines.find((entry) => entry.id === allocation.line_id)
    if (!line) return
    line.paid_amount = round((line.paid_amount || 0) + sign * allocation.principal)
    line.fee_paid = round((line.fee_paid || 0) + sign * allocation.fee)
  })
}

/** Early payoff (spec §29.11): remaining principal − unearned interest − plan discount + late fees. */
export function payoffQuote(schedule, today = todayIso()) {
  const view = serializeSchedule(schedule, today)
  const payoff = schedule.plan_snapshot?.early_payoff || { allowed: true, discount_percent: 0 }
  const open = view.lines.filter((line) => line.in_price && line.status !== 'cancelled' && line.remaining > 0)
  const principal = round(open.reduce((total, line) => total + line.remaining, 0))
  const rebate = payoff.allowed ? round(open.filter((line) => line.due_date > today).reduce((total, line) => total + Math.min(line.interest_share || 0, line.remaining), 0)) : 0
  const discount = payoff.allowed ? round(((principal - rebate) * (Number(payoff.discount_percent) || 0)) / 100) : 0
  const lateFees = view.totals.late_fees
  const outside = round(view.lines.filter((line) => !line.in_price && line.status !== 'cancelled').reduce((total, line) => total + line.remaining, 0))
  return {
    allowed: Boolean(payoff.allowed),
    as_of: today,
    valid_until: addPeriod(today, 7, 'day'),
    principal_remaining: principal,
    interest_rebate: rebate,
    discount,
    late_fees: lateFees,
    total: round(principal - rebate - discount + lateFees),
    outside_price_remaining: outside,
  }
}

/**
 * Early payoff settlement: pays every open in-price line (fees + principal) for exactly `quote.total`;
 * the rebate + discount is booked as `settled_discount` on the latest lines first (the settlement line of §29.11).
 */
export function settlePayoff(schedule, today = todayIso()) {
  const quote = payoffQuote(schedule, today)
  const view = serializeSchedule(schedule, today)
  const open = view.lines.filter((line) => line.in_price && line.status !== 'cancelled' && line.remaining + line.fee_outstanding > 0.005)
  let forgiven = round(quote.interest_rebate + quote.discount)
  const discounts = []
  ;[...open].sort((a, b) => b.due_date.localeCompare(a.due_date)).forEach((line) => {
    const amount = round(Math.min(forgiven, line.remaining))
    if (amount > 0) discounts.push({ line_id: line.id, amount })
    forgiven = round(forgiven - amount)
  })
  const allocations = open
    .map((line) => ({ line_id: line.id, seq: line.seq, fee: line.fee_outstanding, principal: round(line.remaining - (discounts.find((entry) => entry.line_id === line.id)?.amount || 0)) }))
    .filter((allocation) => allocation.fee || allocation.principal)
  return { quote, allocations, discounts }
}

export function applyDiscounts(schedule, discounts, sign = 1) {
  discounts.forEach((discount) => {
    const line = schedule.lines.find((entry) => entry.id === discount.line_id)
    if (line) line.settled_discount = round((line.settled_discount || 0) + sign * discount.amount)
  })
}

/**
 * New lines for a reschedule (spec §29.11): the unpaid in-price principal + open fees split into `count`
 * installments from `first_due`, rounded like the plan with the remainder on the last. Outside-the-price
 * lines that are still open move over unchanged.
 */
export function rescheduleLines(schedule, { count, every = '1 month', first_due: firstDue }, today = todayIso()) {
  const view = serializeSchedule(schedule, today)
  const open = view.lines.filter((line) => line.status !== 'cancelled' && line.remaining + line.fee_outstanding > 0.005)
  const carried = round(open.filter((line) => line.in_price).reduce((total, line) => total + line.remaining + line.fee_outstanding, 0))
  const n = Math.max(Number(count) || 1, 1)
  const step = Number(schedule.plan_snapshot?.rounding?.to) || 1
  const each = step > 1 ? Math.round(carried / n / step) * step : round(carried / n)
  const period = parsePeriod(every)
  const lines = Array.from({ length: n }).map((_, index) => ({
    line_type: 'installment',
    due_date: addPeriod(firstDue || addPeriod(today, 1, 'month'), index * period.amount, period.unit),
    amount: index === n - 1 ? round(carried - each * (n - 1)) : each,
    in_price: true,
    interest_share: 0,
  }))
  open.filter((line) => !line.in_price).forEach((line) => lines.push({ line_type: line.line_type, due_date: line.due_date, amount: line.remaining, in_price: false }))
  return {
    carried_amount: carried,
    lines: lines
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
      .map((line, seq) => ({ ...line, seq, paid_amount: 0, fee_paid: 0 })),
  }
}

/** Collections workspace (spec §29.13): one row per schedule for the chosen view + summary and aging buckets. */
export function collectionsView(schedules, { view = 'overdue', today = todayIso() } = {}) {
  const weekAhead = addPeriod(today, 7, 'day')
  const active = schedules.filter((schedule) => schedule.status === 'active').map((schedule) => serializeSchedule(schedule, today)).filter((schedule) => schedule.status === 'active')
  const aging = Object.fromEntries(AGING_BUCKETS.map((bucket) => [bucket, { count: 0, amount: 0 }]))
  const summary = { due_today: { count: 0, amount: 0 }, overdue: { count: 0, amount: 0 }, upcoming: { count: 0, amount: 0 }, promises: { count: 0, broken: 0 } }
  const rows = []

  active.forEach((schedule) => {
    const open = schedule.lines.filter((line) => line.remaining + line.fee_outstanding > 0.005 && line.status !== 'cancelled')
    const owed = (list) => round(list.reduce((total, line) => total + line.remaining + line.fee_outstanding, 0))
    const dueToday = open.filter((line) => line.due_date === today)
    const upcoming = open.filter((line) => line.due_date > today && line.due_date <= weekAhead)
    const overdue = open.filter((line) => line.status === 'overdue')
    const promises = schedule.promises.filter((promise) => promise.status !== 'kept')
    const openPromise = promises.filter((promise) => promise.status === 'open').sort((a, b) => a.promised_date.localeCompare(b.promised_date))[0] || null

    if (dueToday.length) Object.assign(summary.due_today, { count: summary.due_today.count + 1, amount: round(summary.due_today.amount + owed(dueToday)) })
    if (upcoming.length) Object.assign(summary.upcoming, { count: summary.upcoming.count + 1, amount: round(summary.upcoming.amount + owed(upcoming)) })
    if (overdue.length) Object.assign(summary.overdue, { count: summary.overdue.count + 1, amount: round(summary.overdue.amount + owed(overdue)) })
    overdue.forEach((line) => {
      const bucket = aging[bucketOf(line.days_overdue)]
      bucket.count += 1
      bucket.amount = round(bucket.amount + line.remaining + line.fee_outstanding)
    })
    if (openPromise) summary.promises.count += 1
    summary.promises.broken += promises.filter((promise) => promise.status === 'broken').length

    const pick = { due_today: dueToday, upcoming, overdue, promises: promises.length ? overdue.concat(dueToday) : [] }[view] || []
    if (!pick.length && !(view === 'promises' && promises.length)) return
    rows.push({
      schedule_id: schedule.id,
      schedule_number: schedule.schedule_number,
      contract_id: schedule.contract_id,
      contract_number: schedule.contract_number,
      customer: schedule.customer,
      currency: schedule.currency,
      amount: owed(pick),
      lines_count: pick.length,
      oldest_due_date: pick.map((line) => line.due_date).sort()[0] || null,
      days_overdue: schedule.days_overdue,
      bucket: schedule.days_overdue ? bucketOf(schedule.days_overdue) : null,
      outstanding: schedule.totals.outstanding,
      promise: openPromise || promises[0] || null,
    })
  })

  rows.sort((a, b) => b.days_overdue - a.days_overdue || String(a.oldest_due_date).localeCompare(String(b.oldest_due_date)))
  return { summary, aging, data: rows }
}
