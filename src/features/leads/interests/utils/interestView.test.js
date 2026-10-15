import { describe, expect, it } from 'vitest'
import { buildCatalogIndex, interestFacts, normalizeLevel, toInterestView } from './interestView'

const realEstate = { id: 2, name: 'Real estate', kind: 'product', capabilities: [{ code: 'unique_unit', config: {} }], fulfillmentConfig: {} }
const gym = { id: 6, name: 'Memberships', kind: 'plan', capabilities: [{ code: 'recurrence', config: { every: 1, unit: 'month' } }], fulfillmentConfig: {} }
const catalog = [
  { id: 41, name: 'Villa 12', kind: 'product', price: 9000000, itemTypeId: 2, category: { name: 'Villas' }, capabilityValues: {}, fulfillmentConfig: {}, image: 'v.png' },
  { id: 47, name: 'Gym monthly', kind: 'plan', price: 800, itemTypeId: 6, capabilityValues: {}, fulfillmentConfig: {} },
]
const index = buildCatalogIndex(catalog, [realEstate, gym])

describe('toInterestView', () => {
  it('completes a timeline item that only has a product id', () => {
    const view = toInterestView({ id: 'x', productId: 41, interestLevel: 'HIGH', note: 'later' }, index)
    expect(view).toMatchObject({ name: 'Villa 12', kind: 'product', itemTypeName: 'Real estate', categoryName: 'Villas', price: 9000000, level: 'high', note: 'later', inCatalog: true })
  })

  it('reads a raw lead interest with nested product and the new fields', () => {
    const view = toInterestView({ id: 3, product_id: 47, interest_level: 'hight', notes: 'n', quantity: 2, participants: 3, item_instance_ids: '[1,2]', estimated_value: 1600, is_deal: 1 }, index)
    expect(view).toMatchObject({ name: 'Gym monthly', kind: 'plan', cycleUnit: 'month', level: 'high', note: 'n', isDeal: true, estimatedValue: 1600 })
    expect(view.facts.map((fact) => fact.key)).toEqual(['quantity', 'units', 'participants'])
  })

  it('reads a Leads Center linked product (linkRaw / raw) and keeps its own data when not in the catalog', () => {
    const view = toInterestView({ id: 9, productId: 99, sourceKind: 'manual', name: 'Old item', price: '15.00', note: 'x', interestLevel: 'low', raw: { id: 99, name: 'Old item', type: 'service' }, linkRaw: { id: 9, product_id: 99 } }, index)
    expect(view).toMatchObject({ name: 'Old item', kind: 'service', price: 15, level: 'low', inCatalog: false, sourceKind: 'manual' })
  })
})

describe('helpers', () => {
  it('normalizes levels and facts', () => {
    expect(normalizeLevel('Medium')).toBe('medium')
    expect(normalizeLevel('?')).toBe('')
    expect(interestFacts({ quantity: 1, preferred_date: '2026-11-01T00:00:00', optional_product_ids: [4] })).toEqual([
      { key: 'date', params: { value: '2026-11-01' } },
      { key: 'addOns', params: { count: 1 } },
    ])
  })
})
