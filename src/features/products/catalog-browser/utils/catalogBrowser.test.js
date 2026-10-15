import { describe, expect, it } from 'vitest'
import { categoryOptions, countKinds, filterCatalog, itemTypeOptions } from './catalogBrowser'

const types = [{ id: 2, name: 'Real estate' }, { id: 3, name: 'Tours' }]
const products = [
  { id: 1, name: 'Villa', kind: 'product', status: true, itemTypeId: 2, category: { name: 'Villas' } },
  { id: 2, name: 'Sharm trip', kind: 'service', status: true, itemTypeId: 3, category: { name: 'Trips' } },
  { id: 3, name: 'Gym', kind: 'plan', status: true, itemTypeId: null },
  { id: 4, name: 'Old villa', kind: 'product', status: false, itemTypeId: 2, category: { name: 'Villas' } },
]

describe('catalog browser filters', () => {
  it('filters by kind, type, category and search; hides inactive unless asked', () => {
    const ids = (filters) => filterCatalog(products, filters, types).map((product) => product.id)
    expect(ids({})).toEqual([1, 2, 3])
    expect(ids({ showInactive: true })).toEqual([1, 2, 3, 4])
    expect(ids({ kind: 'service' })).toEqual([2])
    expect(ids({ itemTypeId: 'none' })).toEqual([3])
    expect(ids({ itemTypeId: '2', showInactive: true })).toEqual([1, 4])
    expect(ids({ category: 'villas' })).toEqual([1])
    expect(ids({ search: 'tour' })).toEqual([2])
  })

  it('builds the filter options', () => {
    expect(countKinds(products.slice(0, 3))).toEqual({ all: 3, product: 1, service: 1, plan: 1, bundle: 0 })
    expect(itemTypeOptions(products, types)).toEqual([{ id: 'none', name: '' }, { id: '2', name: 'Real estate' }, { id: '3', name: 'Tours' }])
    expect(categoryOptions(products)).toEqual(['Trips', 'Villas'])
  })
})
