import { serviceEndpoints } from '../../core/api/endpoints'
import { getCollection, registerSeed } from '../db'
import { MockHttpError, notFound } from '../errors'
import { buildPaymentSchedules } from '../seeds/billingSeed'
import { getMockCurrentUser, mockId } from '../seeds/seedUtils'
import { matchesSearch, nowIso, paginate } from '../utils'
import { allocatePayment, applyAllocations, applyDiscounts, collectionsView, settlePayoff, payoffQuote, rescheduleLines, serializeSchedule, todayIso } from '../state/billingLedger'
import './billingHandlers'

registerSeed('paymentSchedules', buildPaymentSchedules)

const B = serviceEndpoints.billing
const METHODS = ['cash', 'bank_transfer', 'card', 'cheque', 'wallet']
const validation = (errors) => {
  if (Object.keys(errors).length) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', errors)
}
const conflict = (code, message) => new MockHttpError(409, code, message)
const reasonRequired = (body) => validation(String(body.reason || '').trim() ? {} : { reason: ['required'] })

function scheduleById(id) {
  const schedule = getCollection('paymentSchedules').find((entry) => entry.id === id)
  if (!schedule) throw notFound('Schedule')
  return schedule
}
function mutable(schedule, body) {
  if (body.version != null && Number(body.version) !== schedule.version) throw conflict('CONFLICT_VERSION', 'Schedule changed')
  if (schedule.status !== 'active') throw conflict('SCHEDULE_NOT_ACTIVE', 'Schedule is not active')
}
const touch = (schedule) => {
  schedule.version += 1
  schedule.updated_at = nowIso()
}
const me = () => {
  const user = getMockCurrentUser()
  return { id: user.id, name: user.name }
}
const detail = (schedule) => ({ data: serializeSchedule(schedule) })

function listItem(schedule) {
  const { lines, payments, promises, plan_snapshot: plan, ...rest } = serializeSchedule(schedule)
  return { ...rest, plan: { id: plan?.plan_id, name: plan?.name, version: plan?.version }, lines_count: lines.length, payments_count: payments.length }
}

/** @type {import('../router').MockRoute[]} */
export const billingSchedulesHandlers = [
  {
    method: 'GET',
    path: B.collections,
    handler: ({ query }) => collectionsView(getCollection('paymentSchedules'), { view: query.view || 'overdue' }),
  },
  {
    method: 'GET',
    path: B.schedules,
    handler: ({ query }) => {
      const items = getCollection('paymentSchedules')
        .filter((schedule) => !query.customer_id || schedule.customer_id === query.customer_id)
        .filter((schedule) => !query.contract_id || schedule.contract_id === query.contract_id)
        .filter((schedule) => matchesSearch([schedule.schedule_number, schedule.contract_number, schedule.customer?.name, schedule.customer?.phone], query.search))
        .map(listItem)
        .filter((schedule) => !query.status || schedule.status === query.status || (query.status === 'overdue' && schedule.overdue_lines > 0))
      return paginate(items, query)
    },
  },
  {
    method: 'GET',
    path: `${B.schedules}/:id`,
    handler: ({ params }) => detail(scheduleById(params.id)),
  },
  {
    method: 'POST',
    path: `${B.schedules}/:id/payments`,
    handler: ({ params, body = {} }) => {
      const schedule = scheduleById(params.id)
      mutable(schedule, body)
      const amount = Math.round(Number(body.amount) * 100) / 100
      validation({ ...(!(amount > 0) && { amount: ['required'] }), ...(!METHODS.includes(body.method) && { method: ['required'] }) })
      // `payoff: true` settles the schedule for exactly the payoff quote (unearned interest forgiven).
      const settlement = body.payoff ? settlePayoff(schedule) : null
      if (settlement && (!settlement.quote.allowed || Math.abs(settlement.quote.total - amount) > 0.01)) validation({ amount: ['payoff_mismatch'] })
      const result = settlement || allocatePayment(schedule, amount, { lineId: body.line_id })
      if (result.error) validation({ amount: ['exceeds_outstanding'] })
      const payment = {
        id: mockId('pay'),
        number: `RC-${String(5000 + schedule.payments.length + getCollection('paymentSchedules').length)}`,
        amount,
        currency: schedule.currency,
        paid_at: body.paid_at ? new Date(body.paid_at).toISOString() : nowIso(),
        method: body.method,
        source: 'manual',
        reference: body.reference || null,
        recorded_by: me(),
        status: 'confirmed',
        reversal_of_id: null,
        allocations: result.allocations,
        settlement_discounts: settlement?.discounts || [],
      }
      applyAllocations(schedule, result.allocations)
      applyDiscounts(schedule, payment.settlement_discounts)
      schedule.payments.unshift(payment)
      touch(schedule)
      return detail(schedule)
    },
  },
  {
    method: 'POST',
    path: `${B.payments}/:id/reverse`,
    handler: ({ params, body = {} }) => {
      const schedule = getCollection('paymentSchedules').find((entry) => entry.payments.some((payment) => payment.id === params.id))
      if (!schedule) throw notFound('Payment')
      const payment = schedule.payments.find((entry) => entry.id === params.id)
      if (payment.status !== 'confirmed' || payment.reversal_of_id) throw conflict('PAYMENT_NOT_REVERSIBLE', 'Payment cannot be reversed')
      reasonRequired(body)
      applyAllocations(schedule, payment.allocations, -1)
      applyDiscounts(schedule, payment.settlement_discounts || [], -1)
      payment.status = 'reversed'
      // A reversal is a new negative record — nothing is deleted (spec §29.11).
      schedule.payments.unshift({ ...payment, id: mockId('pay'), number: `${payment.number}-R`, amount: -payment.amount, paid_at: nowIso(), status: 'confirmed', reversal_of_id: payment.id, reason: body.reason, recorded_by: me(), allocations: payment.allocations.map((allocation) => ({ ...allocation, fee: -allocation.fee, principal: -allocation.principal })), settlement_discounts: [] })
      if (schedule.status === 'completed') schedule.status = 'active'
      touch(schedule)
      return detail(schedule)
    },
  },
  {
    method: 'POST',
    path: `${B.lines}/:id/waive-fee`,
    handler: ({ params, body = {} }) => {
      const schedule = getCollection('paymentSchedules').find((entry) => entry.lines.some((line) => line.id === params.id))
      if (!schedule) throw notFound('Line')
      mutable(schedule, body)
      reasonRequired(body)
      const line = schedule.lines.find((entry) => entry.id === params.id)
      const state = serializeSchedule(schedule).lines.find((entry) => entry.id === line.id)
      if (!(state.fee_outstanding > 0)) throw conflict('NO_LATE_FEE', 'Nothing to waive')
      Object.assign(line, { fee_waived: true, fee_waived_amount: state.fee_outstanding, fee_waived_reason: body.reason, fee_waived_by: me(), fee_waived_at: nowIso() })
      touch(schedule)
      return detail(schedule)
    },
  },
  {
    method: 'POST',
    path: `${B.schedules}/:id/payoff-quote`,
    handler: ({ params }) => {
      const schedule = scheduleById(params.id)
      if (schedule.status !== 'active') throw conflict('SCHEDULE_NOT_ACTIVE', 'Schedule is not active')
      return { data: payoffQuote(schedule) }
    },
  },
  {
    method: 'POST',
    path: `${B.schedules}/:id/reschedule/:decision`,
    handler: ({ params, body = {} }) => {
      const schedule = scheduleById(params.id)
      mutable(schedule, body)
      const request = schedule.pending_reschedule
      if (!request) throw conflict('NO_PENDING_RESCHEDULE', 'Nothing to decide')
      if (params.decision === 'reject') {
        schedule.pending_reschedule = null
        schedule.last_reschedule_decision = { ...request, status: 'rejected', decided_by: me(), decided_at: nowIso(), note: body.note || null }
        touch(schedule)
        return detail(schedule)
      }
      if (params.decision !== 'approve') throw notFound('Action')
      // New schedule version+1 replaces the old one, which is kept as `rescheduled` (spec §29.11).
      const { lines } = rescheduleLines(schedule, request)
      const id = mockId('ps')
      const next = {
        ...schedule,
        id,
        schedule_number: `${schedule.schedule_number.replace(/-V\d+$/, '')}-V${schedule.version + 1}`,
        status: 'active',
        replaces_schedule_id: schedule.id,
        replaced_by_schedule_id: null,
        pending_reschedule: null,
        last_reschedule_decision: null,
        lines: lines.map((line) => ({ ...line, id: `${id}-l${line.seq}` })),
        payments: [],
        promises: [],
        reschedule_reason: request.reason,
        created_at: nowIso(),
        version: 1,
      }
      Object.assign(schedule, { status: 'rescheduled', replaced_by_schedule_id: id, pending_reschedule: null, last_reschedule_decision: { ...request, status: 'approved', decided_by: me(), decided_at: nowIso() } })
      touch(schedule)
      getCollection('paymentSchedules').unshift(next)
      return detail(next)
    },
  },
  {
    method: 'POST',
    path: `${B.schedules}/:id/reschedule`,
    handler: ({ params, body = {} }) => {
      const schedule = scheduleById(params.id)
      mutable(schedule, body)
      if (schedule.pending_reschedule) throw conflict('RESCHEDULE_PENDING', 'A reschedule is already waiting for approval')
      const count = Number(body.count)
      validation({ ...(!(count >= 1 && count <= 120) && { count: ['required'] }), ...(!body.first_due && { first_due: ['required'] }), ...(!String(body.reason || '').trim() && { reason: ['required'] }) })
      const preview = rescheduleLines(schedule, { count, every: body.every || '1 month', first_due: String(body.first_due).slice(0, 10) }, todayIso())
      schedule.pending_reschedule = { count, every: body.every || '1 month', first_due: String(body.first_due).slice(0, 10), reason: body.reason, requested_by: me(), requested_at: nowIso(), status: 'pending_approval', carried_amount: preview.carried_amount, preview_lines: preview.lines }
      touch(schedule)
      return detail(schedule)
    },
  },
  {
    method: 'POST',
    path: `${B.schedules}/:id/cancel`,
    handler: ({ params, body = {} }) => {
      const schedule = scheduleById(params.id)
      mutable(schedule, body)
      reasonRequired(body)
      Object.assign(schedule, { status: 'cancelled', cancelled_reason: body.reason, cancelled_by: me(), cancelled_at: nowIso(), pending_reschedule: null })
      touch(schedule)
      return detail(schedule)
    },
  },
  {
    method: 'POST',
    path: `${B.schedules}/:id/promises`,
    handler: ({ params, body = {} }) => {
      const schedule = scheduleById(params.id)
      mutable(schedule, body)
      const amount = Number(body.amount)
      validation({ ...(!(amount > 0) && { amount: ['required'] }), ...(!(body.promised_date && String(body.promised_date).slice(0, 10) >= todayIso()) && { promised_date: ['required'] }) })
      schedule.promises.unshift({ id: mockId('pr'), amount, promised_date: String(body.promised_date).slice(0, 10), note: body.note || null, created_at: nowIso(), created_by: me() })
      touch(schedule)
      return detail(schedule)
    },
  },
]
