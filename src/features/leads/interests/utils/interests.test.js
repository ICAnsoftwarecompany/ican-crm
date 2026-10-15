import { describe, expect, it } from 'vitest'
import {
  countByKind,
  filterInterestProducts,
  getInterestProfile,
  itemTypeFilters,
  resolveItemType,
} from './interestProfile'
import {
  EMPTY_INTEREST_FORM,
  buildInterestPayload,
  estimateInterest,
  interestToForm,
  toIdList,
  unitPrice,
  validateInterestForm,
} from './interestForm'

const type = (id, kind, capabilities = []) => ({ id, name: `type ${id}`, kind, capabilities, fulfillmentConfig: {} })
const cap = (code, config = {}) => ({ code, version: 1, config })
const product = (patch = {}) => ({ id: 1, name: 'AC', kind: 'product', price: 1000, itemTypeId: null, itemType: null, capabilityValues: {}, fulfillmentConfig: {}, ...patch })

describe('getInterestProfile', () => {
  it('simple product: units and quantity', () => {
    const profile = getInterestProfile(product(), null)
    expect(profile).toMatchObject({ kind: 'product', units: true, quantity: true, unique: false, candidates: false, schedule: false })
  })

  it('unique unit: picks units, no quantity, no unit of measure', () => {
    const profile = getInterestProfile(product(), type(2, 'product', [cap('unique_unit'), cap('availability', { hold_days: 7 })]))
    expect(profile).toMatchObject({ unique: true, candidates: true, units: false, quantity: false, holdDays: 7 })
  })

  it('service with scheduling and participants (product overrides the type config)', () => {
    const itemType = type(3, 'service', [cap('scheduling'), cap('participants', { min: 1, max: 4 })])
    const profile = getInterestProfile(product({ kind: 'service', capabilityValues: { participants: { max: 10 } } }), itemType)
    expect(profile).toMatchObject({ units: false, quantity: false, perPerson: true, schedule: true, participants: { min: 1, max: 10 } })
    const form = { ...EMPTY_INTEREST_FORM, productId: '1', participants: '3' }
    expect(estimateInterest({ product: product({ kind: 'service' }), profile, form }).total).toBe(3000)
  })

  it('plan: recurrence, no quantity', () => {
    const profile = getInterestProfile(product({ kind: 'plan' }), type(4, 'plan', [cap('recurrence', { every: 1, unit: 'year', auto_renew: true })]))
    expect(profile).toMatchObject({ quantity: false, recurrence: { every: 1, unit: 'year', autoRenew: true } })
  })

  it('serial tracking only counts for products', () => {
    expect(getInterestProfile(product(), type(5, 'product', [cap('serial_tracking')])).serial).toBe(true)
    expect(getInterestProfile(product({ kind: 'service' }), type(5, 'service', [cap('serial_tracking')])).serial).toBe(false)
  })
})

describe('resolveItemType', () => {
  it('prefers the nested type with capabilities, else the listed one', () => {
    const listed = type(9, 'product', [cap('warranty')])
    expect(resolveItemType(product({ itemTypeId: 9, itemType: { id: 9, capabilities: [] } }), [listed])).toBe(listed)
    const nested = type(9, 'product', [cap('barcode')])
    expect(resolveItemType(product({ itemTypeId: 9, itemType: nested }), [listed])).toBe(nested)
    expect(resolveItemType(product(), [listed])).toBe(null)
  })
})

describe('picker helpers', () => {
  const products = [
    product({ id: 1, name: 'Villa', itemTypeId: 2 }),
    product({ id: 2, name: 'Cleaning', kind: 'service', itemTypeId: 3 }),
    product({ id: 3, name: 'Gym', kind: 'plan' }),
  ]

  it('filters by kind, type and search', () => {
    expect(filterInterestProducts(products, { kind: 'service' }).map((p) => p.id)).toEqual([2])
    expect(filterInterestProducts(products, { itemTypeId: 'none' }).map((p) => p.id)).toEqual([3])
    expect(filterInterestProducts(products, { itemTypeId: '2' }).map((p) => p.id)).toEqual([1])
    expect(filterInterestProducts(products, { search: 'vil' }).map((p) => p.id)).toEqual([1])
  })

  it('counts kinds and type filters', () => {
    expect(countByKind(products)).toEqual({ all: 3, product: 1, service: 1, plan: 1, bundle: 0 })
    expect(itemTypeFilters(products, [type(2, 'product'), type(3, 'service')]).map((item) => item.id)).toEqual(['none', '2', '3'])
  })
})

describe('interest form', () => {
  it('reads a saved interest', () => {
    const form = interestToForm({ product_id: 5, interest_level: 'hight', notes: 'n', quantity: 3, item_instance_ids: '[7,8]' })
    expect(form).toMatchObject({ productId: '5', level: 'high', note: 'n', quantity: '3', instanceIds: ['7', '8'] })
    expect(toIdList('1, 2')).toEqual(['1', '2'])
  })

  it('unit price from the unit, else price × factor', () => {
    expect(unitPrice(product(), null)).toBe(1000)
    expect(unitPrice(product(), { price: 9000, factor: 10 })).toBe(9000)
    expect(unitPrice(product(), { price: null, factor: 10 })).toBe(10000)
  })

  it('estimates base × quantity + chosen optional items', () => {
    const profile = getInterestProfile(product(), null)
    const relations = [
      { childProductId: 20, inclusion: 'optional', priceOverride: null, childPrice: 300, quantity: 1 },
      { childProductId: 21, inclusion: 'included', priceOverride: 0, childPrice: 500, quantity: 1 },
    ]
    const form = { ...EMPTY_INTEREST_FORM, productId: '1', quantity: '2', optionalIds: ['20', '21'] }
    expect(estimateInterest({ product: product(), profile, form, relations })).toEqual({ base: 2000, extras: 300, total: 2300 })
    expect(estimateInterest({ product: product({ price: null }), profile, form, relations }).total).toBe(null)
  })

  it('validates quantity and participants', () => {
    const profile = getInterestProfile(product({ kind: 'service' }), type(3, 'service', [cap('participants', { min: 2, max: 4 })]))
    expect(validateInterestForm({ ...EMPTY_INTEREST_FORM }, null)).toEqual({ productId: 'chooseProduct' })
    expect(validateInterestForm({ ...EMPTY_INTEREST_FORM, productId: '1', quantity: '0' }, getInterestProfile(product(), null))).toEqual({ quantity: 'quantity' })
    expect(validateInterestForm({ ...EMPTY_INTEREST_FORM, productId: '1', quantity: '0' }, profile)).toEqual({})
    expect(validateInterestForm({ ...EMPTY_INTEREST_FORM, productId: '1', participants: '5' }, profile)).toEqual({ participants: 'participantsMax' })
    expect(validateInterestForm({ ...EMPTY_INTEREST_FORM, productId: '1', participants: '1' }, profile)).toEqual({ participants: 'participantsMin' })
  })

  it('keeps the old request shape and adds only the fields that apply', () => {
    const simple = buildInterestPayload({ leadId: '4', form: { ...EMPTY_INTEREST_FORM, productId: '1', note: ' hi ' }, product: product(), profile: getInterestProfile(product(), null) })
    expect(simple).toEqual({ lead_id: 4, interesteds: [{ product_id: 1, note: 'hi', interest_level: 'high', quantity: 1 }] })

    const villa = product({ itemTypeId: 2 })
    const profile = getInterestProfile(villa, type(2, 'product', [cap('unique_unit')]))
    const form = { ...EMPTY_INTEREST_FORM, productId: '1', quantity: '9', productUnitId: '3', instanceIds: ['7'], preferredDate: '2026-11-01' }
    const payload = buildInterestPayload({ leadId: 4, form, product: villa, profile, interestId: 12, estimate: { total: 1000 } })
    expect(payload).toEqual({
      lead_id: 4,
      id: 12,
      interesteds: [{ id: 12, product_id: 1, note: '', interest_level: 'high', item_type_id: 2, item_instance_ids: [7], estimated_value: 1000 }],
    })
  })
})
