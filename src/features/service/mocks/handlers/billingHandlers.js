import { serviceEndpoints } from '../../core/api/endpoints'
import { crudHandlers, requiredLabel } from '../crud'
import { getCollection, registerSeed } from '../db'
import { MockHttpError, notFound } from '../errors'
import { buildPaymentPlans, buildPlanAssignments } from '../seeds/billingSeed'
import { previewPlan } from '../state/paymentPlanEngine'
import './catalogHandlers'

registerSeed('paymentPlans', buildPaymentPlans)
registerSeed('planAssignments', buildPlanAssignments)

const { settings } = serviceEndpoints
const validation = (errors) => {
  if (Object.keys(errors).length) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', errors)
}

function validatePlan(body) {
  const components = body.config?.components || []
  const installments = components.filter((component) => component.type === 'installments')
  return {
    ...(requiredLabel(body.name) && { name: ['required'] }),
    ...(!components.length && { components: ['required'] }),
    ...(installments.length > 1 && { components: ['invalid'] }),
    ...(installments.some((component) => !(Number(component.count) > 0)) && { components: ['invalid'] }),
  }
}

/**
 * Plans available for an item, nearest scope wins (spec §29.5): item → item type → tenant.
 * Excluded assignments hide a plan; `price_adjustment` on the assignment overrides the plan's.
 */
export function plansForItem(itemId) {
  const item = getCollection('catalogItems').find((entry) => entry.id === itemId)
  if (!item) return []
  const assignments = getCollection('planAssignments').filter((entry) => entry.active !== false)
  const forItem = assignments.filter((entry) => entry.scope_type === 'item' && entry.scope_id === item.id)
  const forType = assignments.filter((entry) => entry.scope_type === 'item_type' && entry.scope_id === item.service_config?.item_type_id)
  const excluded = new Set(forItem.filter((entry) => entry.is_excluded).map((entry) => entry.payment_plan_id))
  const chosen = new Map()
  ;[...forType, ...forItem.filter((entry) => !entry.is_excluded)].forEach((entry) => chosen.set(entry.payment_plan_id, entry))
  return [...chosen.values()]
    .filter((entry) => !excluded.has(entry.payment_plan_id))
    .map((entry) => {
      const plan = getCollection('paymentPlans').find((candidate) => candidate.id === entry.payment_plan_id && candidate.status !== 'archived')
      return plan && { ...plan, is_default: entry.is_default, assignment_id: entry.id, config: entry.price_adjustment ? { ...plan.config, price_adjustment: entry.price_adjustment } : plan.config }
    })
    .filter(Boolean)
}

/** @type {import('../router').MockRoute[]} */
export const billingHandlers = [
  ...crudHandlers({ collection: 'paymentPlans', path: settings.paymentPlans, prefix: 'pp', validate: validatePlan, canDelete: (plan) => {
    if (getCollection('planAssignments').some((entry) => entry.payment_plan_id === plan.id)) throw new MockHttpError(409, 'RESOURCE_IN_USE', 'Plan is assigned')
  } }).map((route) =>
    route.method === 'GET' && route.path === settings.paymentPlans
      ? { ...route, handler: ({ query }) => ({ data: query.item_id ? plansForItem(query.item_id) : getCollection('paymentPlans') }) }
      : route.method === 'PATCH'
        ? { ...route, handler: (context) => route.handler({ ...context, body: { ...context.body, version: (getCollection('paymentPlans').find((plan) => plan.id === context.params.id)?.version || 1) + 1 } }) }
        : route
  ),
  ...crudHandlers({
    collection: 'planAssignments',
    path: settings.planAssignments,
    prefix: 'ppa',
    validate: (body) => ({
      ...(!['item_type', 'item', 'category'].includes(body.scope_type) && { scope_type: ['required'] }),
      ...(!body.scope_id && { scope_id: ['required'] }),
      ...(!body.payment_plan_id && { payment_plan_id: ['required'] }),
    }),
  }),
  {
    method: 'POST',
    path: `${settings.paymentPlans}/:id/preview`,
    handler: ({ params, body = {} }) => {
      const plan = getCollection('paymentPlans').find((entry) => entry.id === params.id)
      if (!plan) throw notFound('Plan')
      const item = body.item_id ? getCollection('catalogItems').find((entry) => entry.id === body.item_id) : null
      const price = body.price != null && body.price !== '' ? Number(body.price) : item?.price
      validation({ ...(!(price > 0) && { price: ['required'] }), ...(!body.contract_date && { contract_date: ['required'] }) })
      const assigned = item ? plansForItem(item.id).find((entry) => entry.id === plan.id) : null
      return { data: { plan: { id: plan.id, name: plan.name, version: plan.version }, ...previewPlan((assigned || plan).config, { ...body, price }) } }
    },
  },
]
