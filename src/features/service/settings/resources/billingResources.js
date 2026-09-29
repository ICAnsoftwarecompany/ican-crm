import { CalendarRange, Link2 } from 'lucide-react'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { PlanComponentsField } from '../../billing/components/PlanComponentsField'
import { labelOptions, listOf, listText } from './resourceHelpers'

const { settings } = serviceEndpoints
const L = () => ({ ar: '', en: '' })

/** Flat form ↔ plan `config` JSON (spec §29.4). */
const fromItem = (item) => {
  const config = item.config || {}
  return {
    ...item,
    components: config.components || [],
    price_adjustment_percent: config.price_adjustment?.type === 'percent' ? config.price_adjustment.value : null,
    interest_type: config.interest?.type || 'none',
    interest_value: config.interest?.value ?? 0,
    grace_days: config.grace_days ?? 5,
    late_fee_percent: config.late_fee?.value ?? 0,
    late_fee_cap: config.late_fee?.cap_percent ?? null,
    early_payoff_allowed: config.early_payoff?.allowed ?? true,
    rounding_to: config.rounding?.to ?? 1,
    min_down_percent: config.limits?.min_down_percent ?? null,
    max_count: config.limits?.max_count ?? null,
    max_discount_percent: config.limits?.max_discount_percent ?? null,
    reservation_fee: config.reservation_fee?.amount ?? null,
  }
}

const toPayload = (values) => ({
  name: values.name,
  type: values.type || 'installments',
  status: values.status || 'active',
  config: {
    components: values.components,
    price_adjustment: values.price_adjustment_percent ? { type: 'percent', value: Number(values.price_adjustment_percent) } : { type: 'none', value: 0 },
    interest: { type: values.interest_type || 'none', value: Number(values.interest_value) || 0 },
    admin_fee: { type: 'fixed', value: 0 },
    grace_days: Number(values.grace_days) || 0,
    late_fee: { type: 'percent', value: Number(values.late_fee_percent) || 0, per: 'month', cap_percent: values.late_fee_cap == null ? null : Number(values.late_fee_cap) },
    early_payoff: { allowed: Boolean(values.early_payoff_allowed), discount_percent: 0 },
    schedule_mode: 'equal',
    rounding: { to: Number(values.rounding_to) || 1, remainder_on: 'last' },
    limits: { min_down_percent: values.min_down_percent, max_count: values.max_count, max_discount_percent: values.max_discount_percent },
    reservation_fee: values.reservation_fee ? { amount: Number(values.reservation_fee), deducted_from: 'down_payment', refundable: false } : null,
  },
})

export const paymentPlansResource = {
  key: 'paymentPlans',
  endpoint: settings.paymentPlans,
  icon: CalendarRange,
  i18nKey: 'service.settings.resources.paymentPlans',
  titleField: 'name',
  dialogClassName: 'max-w-3xl',
  invalidates: [serviceKeys.billing()],
  emptyValue: () => fromItem({ name: L(), type: 'installments', status: 'active', config: { components: [{ type: 'down_payment', basis: 'percent', value: 10, due: 'on_contract' }, { type: 'installments', basis: 'remaining', count: 12, every: '1 month', first_due: '+1 month' }] } }),
  fromItem,
  toPayload,
  fields: [
    { name: 'name', type: 'localized', labelKey: 'service.settings.fields.name' },
    { name: 'components', type: 'custom', component: PlanComponentsField, labelKey: 'service.billing.fields.components' },
    { name: 'price_adjustment_percent', type: 'number', labelKey: 'service.billing.fields.priceAdjustment', hintKey: 'service.billing.fields.priceAdjustmentHint', row: 'a' },
    { name: 'rounding_to', type: 'number', labelKey: 'service.billing.fields.roundingTo', row: 'a' },
    { name: 'interest_type', type: 'select', labelKey: 'service.billing.fields.interest', row: 'b', options: (ctx) => ['none', 'flat', 'percent_per_period'].map((value) => ({ value, label: ctx.t(`service.billing.interestTypes.${value}`) })) },
    { name: 'interest_value', type: 'number', labelKey: 'service.billing.fields.interestValue', row: 'b', hiddenWhen: (values) => values.interest_type === 'none' },
    { name: 'min_down_percent', type: 'number', labelKey: 'service.billing.fields.minDown', row: 'c' },
    { name: 'max_count', type: 'number', labelKey: 'service.billing.fields.maxCount', row: 'c' },
    { name: 'max_discount_percent', type: 'number', labelKey: 'service.billing.fields.maxDiscount', row: 'c' },
    { name: 'grace_days', type: 'number', labelKey: 'service.billing.fields.graceDays', row: 'd' },
    { name: 'late_fee_percent', type: 'number', labelKey: 'service.billing.fields.lateFee', row: 'd' },
    { name: 'late_fee_cap', type: 'number', labelKey: 'service.billing.fields.lateFeeCap', row: 'd' },
    { name: 'reservation_fee', type: 'number', labelKey: 'service.billing.fields.reservationFee', hintKey: 'service.billing.fields.reservationFeeHint' },
    { name: 'early_payoff_allowed', type: 'switch', labelKey: 'service.billing.fields.earlyPayoff' },
  ],
  summary: (item, ctx) => {
    const components = item.config?.components || []
    const installments = components.find((entry) => entry.type === 'installments')
    return [
      installments && ctx.t('service.billing.installmentsSummary', { count: installments.count, every: installments.every }),
      listText(components.filter((entry) => entry.type !== 'installments').map((entry) => ctx.t(`service.billing.componentTypes.${entry.type}`)), ctx.language),
      ctx.t('service.pipelines.version', { version: item.version || 1 }),
    ].filter(Boolean).join(' · ')
  },
}

/** Where plans apply (spec §29.5): nearest scope wins — item → item type. */
export const planAssignmentsResource = {
  key: 'planAssignments',
  endpoint: settings.planAssignments,
  icon: Link2,
  i18nKey: 'service.settings.resources.planAssignments',
  dependsOn: ['paymentPlans', 'itemTypes', 'catalogItems'],
  invalidates: [serviceKeys.billing()],
  title: (item, ctx) => labelOptions(listOf(ctx, 'paymentPlans').filter((plan) => plan.id === item.payment_plan_id), ctx.language, 'name')[0]?.label || item.payment_plan_id,
  emptyValue: () => ({ scope_type: 'item_type', scope_id: '', payment_plan_id: '', is_default: false, is_excluded: false, price_adjustment_percent: null, active: true }),
  fromItem: (item) => ({ ...item, price_adjustment_percent: item.price_adjustment?.value ?? null }),
  toPayload: ({ price_adjustment_percent: percent, ...values }) => ({ ...values, price_adjustment: percent ? { type: 'percent', value: Number(percent) } : null }),
  fields: [
    { name: 'scope_type', type: 'select', labelKey: 'service.billing.fields.scopeType', row: 'a', options: (ctx) => ['item_type', 'item'].map((value) => ({ value, label: ctx.t(`service.billing.scopes.${value}`) })) },
    {
      name: 'scope_id',
      type: 'select',
      labelKey: 'service.billing.fields.scope',
      row: 'a',
      options: (ctx, values) => (values?.scope_type === 'item' ? labelOptions(ctx.catalogItems || [], ctx.language, 'name') : labelOptions(listOf(ctx, 'itemTypes'), ctx.language, 'name')),
    },
    { name: 'payment_plan_id', type: 'select', labelKey: 'service.billing.fields.plan', options: (ctx) => labelOptions(listOf(ctx, 'paymentPlans'), ctx.language, 'name') },
    { name: 'price_adjustment_percent', type: 'number', labelKey: 'service.billing.fields.priceAdjustment', hintKey: 'service.billing.fields.assignmentAdjustmentHint' },
    { name: 'is_default', type: 'switch', labelKey: 'service.billing.fields.isDefault' },
    { name: 'is_excluded', type: 'switch', labelKey: 'service.billing.fields.isExcluded', hintKey: 'service.billing.fields.isExcludedHint' },
  ],
  summary: (item, ctx) => {
    const scope = item.scope_type === 'item' ? (ctx.catalogItems || []).find((entry) => entry.id === item.scope_id) : listOf(ctx, 'itemTypes').find((entry) => entry.id === item.scope_id)
    return [
      `${ctx.t(`service.billing.scopes.${item.scope_type}`)}: ${labelOptions(scope ? [scope] : [], ctx.language, 'name')[0]?.label || item.scope_id}`,
      item.is_default && ctx.t('service.billing.fields.isDefault'),
      item.is_excluded && ctx.t('service.billing.excluded'),
    ].filter(Boolean).join(' · ')
  },
}
