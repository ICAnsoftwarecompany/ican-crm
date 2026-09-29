/**
 * Payment plan library + assignments per template (spec §29.4–29.5).
 * Plans are rules, not amounts; the real-estate "8 years" plan from the spec is in every template.
 */
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
