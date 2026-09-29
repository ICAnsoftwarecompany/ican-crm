/**
 * Payment plan library + assignments per template (spec §29.4–29.5).
 * Plans are rules, not amounts; the real-estate "8 years" plan from the spec is in every template.
 */
import { buildContractsState } from './contractsSeed'
import { createRandom } from './seedUtils'
import { addPeriod, previewPlan } from '../state/paymentPlanEngine'
import { todayIso } from '../state/billingLedger'

const L = (ar, en) => ({ ar, en })

const base = (extra) => ({
  price_adjustment: { type: 'none', value: 0 },
  interest: { type: 'none', value: 0 },
  admin_fee: { type: 'fixed', value: 0 },
  grace_days: 5,
  late_fee: { type: 'percent', value: 1, per: 'month', cap_percent: 10 },
  early_payoff: { allowed: true, discount_percent: 0 },
  schedule_mode: 'equal',
  rounding: { to: 10, remainder_on: 'last' },
  limits: { min_down_percent: 10, max_count: 36, max_discount_percent: 5 },
  reservation_fee: null,
  ...extra,
})

const EIGHT_YEARS = {
  id: 'pp-8y',
  name: L('8 سنين ربع سنوي', '8 years quarterly'),
  type: 'installments',
  status: 'active',
  version: 1,
  config: base({
    components: [
      { type: 'down_payment', basis: 'percent', value: 10, due: 'on_contract' },
      { type: 'installments', basis: 'remaining', count: 32, every: '3 month', first_due: '+3 month' },
      { type: 'delivery', basis: 'percent', value: 5, due: 'on_delivery' },
      { type: 'maintenance', basis: 'percent', value: 8, due: '-12 month from delivery', outside_price: true },
    ],
    price_adjustment: { type: 'percent', value: 15 },
    rounding: { to: 100, remainder_on: 'last' },
    limits: { min_down_percent: 5, max_count: 40, max_discount_percent: 5 },
    reservation_fee: { amount: 50000, deducted_from: 'down_payment', refundable: false },
  }),
}

const PLANS = {
  devices: [
    { id: 'pp-12m', name: L('12 شهر بدون فوائد', '12 months, no interest'), type: 'installments', status: 'active', version: 1, config: base({ components: [{ type: 'down_payment', basis: 'percent', value: 20, due: 'on_contract' }, { type: 'installments', basis: 'remaining', count: 12, every: '1 month', first_due: '+1 month' }] }) },
    { id: 'pp-24m', name: L('24 شهر بفائدة 12%', '24 months, 12% flat'), type: 'installments', status: 'active', version: 1, config: base({ components: [{ type: 'down_payment', basis: 'percent', value: 10, due: 'on_contract' }, { type: 'installments', basis: 'remaining', count: 24, every: '1 month', first_due: '+1 month' }], interest: { type: 'flat', value: 12 } }) },
  ],
  tourism: [
    { id: 'pp-trip', name: L('30% مقدم والباقي قبل السفر', '30% now, balance before travel'), type: 'installments', status: 'active', version: 1, config: base({ components: [{ type: 'down_payment', basis: 'percent', value: 30, due: 'on_contract' }, { type: 'installments', basis: 'remaining', count: 1, every: '1 month', first_due: '-14 day from delivery' }], limits: { min_down_percent: 20, max_count: 3, max_discount_percent: 10 } }) },
  ],
  school: [
    { id: 'pp-quarters', name: L('4 أقساط ربع سنوية', '4 quarterly installments'), type: 'installments', status: 'active', version: 1, config: base({ components: [{ type: 'installments', basis: 'remaining', count: 4, every: '3 month', first_due: '+0 month' }], limits: { max_count: 10, max_discount_percent: 15 } }) },
    { id: 'pp-monthly', name: L('10 أقساط شهرية', '10 monthly installments'), type: 'installments', status: 'active', version: 1, config: base({ components: [{ type: 'down_payment', basis: 'percent', value: 10, due: 'on_contract' }, { type: 'installments', basis: 'remaining', count: 10, every: '1 month', first_due: '+1 month' }] }) },
  ],
  shipping: [
    { id: 'pp-cod-balance', name: L('تسوية شهرية', 'Monthly settlement'), type: 'installments', status: 'active', version: 1, config: base({ components: [{ type: 'installments', basis: 'remaining', count: 1, every: '1 month', first_due: '+1 month' }], limits: {} }) },
  ],
}

const ASSIGNMENTS = {
  devices: [['item_type', 'it-air_conditioner', 'pp-12m', true], ['item_type', 'it-air_conditioner', 'pp-24m', false], ['item_type', 'it-maintenance_plan', 'pp-12m', true]],
  tourism: [['item_type', 'it-package', 'pp-trip', true]],
  school: [['item_type', 'it-school_year', 'pp-quarters', true], ['item_type', 'it-school_year', 'pp-monthly', false]],
  shipping: [['item_type', 'it-merchant_plan', 'pp-cod-balance', true]],
}

export const buildPaymentPlans = (manifest) => [...(PLANS[manifest.template] || PLANS.devices), EIGHT_YEARS]

export const buildPlanAssignments = (manifest) =>
  (ASSIGNMENTS[manifest.template] || ASSIGNMENTS.devices).map(([scopeType, scopeId, planId, isDefault], index) => ({
    id: `ppa-${index + 1}`,
    scope_type: scopeType,
    scope_id: scopeId,
    payment_plan_id: planId,
    is_default: isDefault,
    price_adjustment: null,
    is_excluded: false,
    active: true,
  }))

/**
 * Payment schedules for the seeded signed contracts (spec §29.10): built with the same preview engine,
 * then history is replayed — lines due in the past are paid, except the scenarios the collections
 * workspace needs (overdue, partially paid, due today, promises).
 */
export function buildPaymentSchedules(manifest) {
  const random = createRandom(`schedules-${manifest.template}`)
  const today = todayIso()
  const plans = buildPaymentPlans(manifest)
  const { contracts } = buildContractsState(manifest)
  const schedules = []

  contracts.forEach((contract, index) => {
    if (!['signed', 'active', 'expiring', 'terminated'].includes(contract.status) || !(contract.total_value > 0)) return
    const plan = plans[index === 6 && plans.length > 2 ? 1 : 0]
    const contractDate = contract.start_date.slice(0, 10)
    const preview = previewPlan(plan.config, { price: contract.total_value, contract_date: contractDate, delivery_date: contract.end_date?.slice(0, 10) || addPeriod(contractDate, 6, 'month') })
    const id = `ps-${index + 1}`
    const lines = preview.lines.map((line) => ({ ...line, id: `${id}-l${line.seq}`, paid_amount: 0, fee_paid: 0 }))
    const due = lines.filter((line) => line.due_date && line.due_date < today)
    const unpaid = new Set(index === 5 ? due.slice(-2).map((line) => line.id) : index === 7 ? due.slice(-2, -1).map((line) => line.id) : [])
    const partial = index === 7 ? due[due.length - 1] : null
    const payments = []
    due.forEach((line) => {
      if (unpaid.has(line.id)) return
      const amount = line === partial ? Math.round(line.amount / 2) : line.amount
      line.paid_amount = amount
      const paidAt = addPeriod(line.due_date, random.int(0, 3), 'day')
      payments.push({
        id: `${id}-p${payments.length + 1}`,
        number: `RC-${String(1000 + index * 50 + payments.length)}`,
        amount,
        currency: contract.currency,
        paid_at: `${paidAt < today ? paidAt : today}T10:00:00.000Z`,
        method: random.pick(['cash', 'bank_transfer', 'card', 'wallet']),
        source: 'manual',
        reference: null,
        recorded_by: { id: 'agent-4', name: 'كريم عادل' },
        status: 'confirmed',
        reversal_of_id: null,
        allocations: [{ line_id: line.id, seq: line.seq, fee: 0, principal: amount }],
      })
    })
    const promises = index === 5
      ? [
          { id: `${id}-pr1`, amount: due[due.length - 2]?.amount || 1000, promised_date: addPeriod(today, -10, 'day'), note: 'وعد بالسداد بعد القبض', created_at: `${addPeriod(today, -20, 'day')}T09:00:00.000Z`, created_by: { id: 'agent-4', name: 'كريم عادل' } },
          { id: `${id}-pr2`, amount: due[due.length - 1]?.amount || 1000, promised_date: addPeriod(today, 3, 'day'), note: 'اتصال: هيحوّل أول الأسبوع', created_at: `${addPeriod(today, -1, 'day')}T09:00:00.000Z`, created_by: { id: 'agent-4', name: 'كريم عادل' } },
        ]
      : []

    schedules.push({
      id,
      schedule_number: `PS-2026-${String(500 + index)}`,
      contract_id: contract.id,
      contract_number: contract.contract_number,
      customer: contract.customer,
      customer_id: contract.customer_id,
      currency: contract.currency,
      plan_snapshot: { ...plan.config, plan_id: plan.id, name: plan.name, version: plan.version },
      final_price: preview.final_price,
      status: contract.status === 'terminated' ? 'cancelled' : 'active',
      cancelled_reason: contract.status === 'terminated' ? contract.terminated_reason : null,
      replaces_schedule_id: null,
      replaced_by_schedule_id: null,
      pending_reschedule: null,
      lines,
      payments: payments.reverse(),
      promises,
      created_at: contract.signed_at || contract.start_date,
      version: 1,
    })
  })
  return schedules
}
