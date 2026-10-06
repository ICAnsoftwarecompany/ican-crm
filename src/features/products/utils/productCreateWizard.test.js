import { describe, expect, it } from 'vitest'
import { EMPTY_PRODUCT_FORM } from './catalogForms'
import { normalizeItemType } from './catalogNormalize'
import {
  buildCreatePlan,
  buildRelationBodies,
  createInstancesState,
  instanceModesForItemType,
  remainingRequests,
  requiresSerials,
  stockComesFromInstances,
  validateWizardStep,
} from './productCreateWizard'

const appliance = normalizeItemType({
  id: 4, kind: 'product',
  capabilities: [{ code: 'serial_tracking', config: { required: true, pattern: '^[A-Z0-9]{8,12}$' } }, { code: 'warranty', config: { months: 24 } }],
})
const medicine = normalizeItemType({ id: 5, kind: 'product', capabilities: [{ code: 'batch_lot' }, { code: 'expiry', config: { alert_days: 60 } }] })

const state = (patch = {}) => ({
  form: { ...EMPTY_PRODUCT_FORM, name: 'AC', price: '15000', item_type_id: '4', capability_values: { warranty: { months: '36' } } },
  relations: [],
  instances: createInstancesState('serial'),
  ...patch,
})

describe('item type rules', () => {
  it('reads instance modes, required serials and stock source', () => {
    expect(instanceModesForItemType(appliance)).toEqual(['serial'])
    expect(instanceModesForItemType(medicine)).toEqual(['batch'])
    expect(requiresSerials(appliance)).toBe(true)
    expect(stockComesFromInstances(appliance)).toBe(true)
    expect(stockComesFromInstances(medicine)).toBe(false)
    expect(instanceModesForItemType(null)).toEqual([])
  })
})

describe('buildCreatePlan', () => {
  it('builds the product, relations and serial instances in collection shapes', () => {
    const plan = buildCreatePlan(state({
      relations: [
        { key: 'r1', child_product_id: '32', inclusion: 'included', quantity: '1', price_override: '0', auto_add: true },
        { key: 'r2', child_product_id: '', inclusion: 'optional', quantity: '1', price_override: '', auto_add: false },
        { key: 'r3', child_product_id: '33', inclusion: 'optional', quantity: '2', price_override: '1200', auto_add: false },
      ],
      instances: { ...createInstancesState('serial'), serials: 'AC12345678\nAC12345679' },
    }), appliance)

    expect(plan.product).toMatchObject({ name: 'AC', kind: 'product', price: 15000, capability_values: { warranty: { months: 36 } } })
    expect(plan.product).not.toHaveProperty('is_stock_tracked')
    expect(plan.relations).toEqual([
      { key: 'r1', body: { child_product_id: '32', inclusion: 'included', quantity: 1, price_override: 0, auto_add: true, sort_order: 1 } },
      { key: 'r3', body: { child_product_id: '33', inclusion: 'optional', quantity: 2, price_override: 1200, auto_add: false, sort_order: 2 } },
    ])
    expect(plan.instances).toEqual({ mode: 'serial', instances: [{ serial_number: 'AC12345678' }, { serial_number: 'AC12345679' }], invalid: [] })
  })

  it('sends no instances when the item type holds none', () => {
    const plan = buildCreatePlan(state({ instances: { ...createInstancesState('serial'), serials: 'X1' } }), null)
    expect(plan.instances.instances).toEqual([])
  })

  it('builds batch instances for an expiry item type', () => {
    const plan = buildCreatePlan(state({ instances: { ...createInstancesState('batch'), batchRows: [{ key: 'b', batch_no: 'B-1', expiry_date: '2027-09-01' }] } }), medicine)
    expect(plan.instances.instances).toEqual([{ batch_no: 'B-1', expiry_date: '2027-09-01' }])
  })
})

describe('validation and resume', () => {
  it('flags duplicate attached items and serials off pattern', () => {
    expect(validateWizardStep('relations', state({
      relations: [{ key: 'a', child_product_id: '32', quantity: '1' }, { key: 'b', child_product_id: '32', quantity: '1' }],
    }))).toEqual({ 'relations.b': 'duplicateItem' })
    expect(validateWizardStep('instances', state({ instances: { ...createInstancesState('serial'), serials: 'bad' } }), appliance))
      .toEqual({ instances: 'patternMismatch' })
  })

  it('keeps only the requests that did not succeed', () => {
    const plan = { relations: [{ key: 'r1' }, { key: 'r2' }], instances: { instances: [{ serial_number: 'A' }] } }
    expect(remainingRequests(plan, { productId: 9, relations: ['r1'], instances: false })).toEqual({
      product: false, relations: [{ key: 'r2' }], instances: true,
    })
    expect(buildRelationBodies([{ key: 'x', child_product_id: '', quantity: '1' }])).toEqual([])
  })
})
