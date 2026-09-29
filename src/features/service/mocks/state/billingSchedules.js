import { getCollection } from '../db'
import { mockId } from '../seeds/seedUtils'
import { nowIso } from '../utils'
import { previewPlan } from './paymentPlanEngine'

/**
 * Contract signed → payment schedule (spec §29.9): the plan, price and schedule are frozen as a
 * snapshot (`plan_snapshot`). Runs only when the contract carries `payment_plan_id`; idempotent.
 */
export function createScheduleFromContract(contract) {
  if (!contract.payment_plan_id) return null
  const schedules = getCollection('paymentSchedules')
  const existing = schedules.find((entry) => entry.contract_id === contract.id && entry.status !== 'rescheduled')
  if (existing) return existing
  const plan = getCollection('paymentPlans').find((entry) => entry.id === contract.payment_plan_id)
  if (!plan || !(contract.total_value > 0)) return null
  const contractDate = (contract.start_date || nowIso()).slice(0, 10)
  const preview = previewPlan(plan.config, { price: contract.total_value, contract_date: contractDate, delivery_date: contract.end_date?.slice(0, 10), overrides: contract.plan_overrides || {} })
  const id = mockId('ps')
  const schedule = {
    id,
    schedule_number: `PS-2026-${String(500 + schedules.length + 20)}`,
    contract_id: contract.id,
    contract_number: contract.contract_number,
    customer: contract.customer,
    customer_id: contract.customer_id,
    currency: contract.currency,
    plan_snapshot: { ...plan.config, plan_id: plan.id, name: plan.name, version: plan.version },
    final_price: preview.final_price,
    status: 'active',
    cancelled_reason: null,
    replaces_schedule_id: null,
    replaced_by_schedule_id: null,
    pending_reschedule: null,
    lines: preview.lines.map((line) => ({ ...line, id: `${id}-l${line.seq}`, paid_amount: 0, fee_paid: 0 })),
    payments: [],
    promises: [],
    created_at: nowIso(),
    version: 1,
  }
  schedules.unshift(schedule)
  contract.payment_schedule_id = schedule.id
  return schedule
}
