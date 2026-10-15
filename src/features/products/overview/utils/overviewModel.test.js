import { describe, expect, it } from 'vitest'
import { buildProductsOverview } from './overviewModel'

const products = [
  { id: 1, name: 'AC', kind: 'product', price: 100, isStockTracked: true, stockQuantity: 3, status: true, categoryId: 2, itemTypeId: 4, description: 'x', image: 'a' },
  { id: 2, name: 'Fan', kind: 'product', price: 50, isStockTracked: false, status: true, categoryId: 2, itemTypeId: null },
  { id: 3, name: 'Plan', kind: 'plan', price: 20, status: false, categoryId: null, itemTypeId: null },
  { id: 4, name: 'Install', kind: 'service', price: 30, status: true, categoryId: 9, itemTypeId: null },
]
const itemTypes = [{ id: 4, name: 'Appliances', kind: 'product', status: true }]
const categories = [{ id: 2, _pathLabel: 'Electronics / Cooling' }, { id: 9, _pathLabel: 'Services' }]

describe('buildProductsOverview', () => {
  const overview = buildProductsOverview({ products, itemTypes, categories })

  it('totals counts and values, services include plans and bundles', () => {
    expect(overview.total).toEqual({ count: 4, listValue: 200, stockValue: 300 })
    expect(overview.product).toMatchObject({ count: 2, active: 2, listValue: 150, stockValue: 300, withoutType: 1, withoutCategory: 0, itemTypes: 1 })
    expect(overview.service).toMatchObject({ count: 2, active: 1, listValue: 50, itemTypes: 0 })
  })

  it('ranks categories and item types with names', () => {
    expect(overview.product.topCategories[0]).toMatchObject({ key: '2', label: 'Electronics / Cooling', value: 2 })
    expect(overview.product.topItemTypes.find((row) => row.key === '4')).toMatchObject({ label: 'Appliances', value: 1 })
    expect(overview.product.topItemTypes.find((row) => row.key === '__none__').value).toBe(1)
  })

  it('flags missing item types and counts incomplete items', () => {
    expect(overview.alerts).toEqual({ noProductTypes: false, noServiceTypes: true })
    expect(overview.product.incomplete).toBe(1)
    expect(overview.product.completenessLevels.find((row) => row.key === 'complete').value).toBe(1)
  })
})
