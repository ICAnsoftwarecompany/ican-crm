import { describe, expect, it } from 'vitest'
import { flattenCatalogProducts } from './catalog'

describe('flattenCatalogProducts', () => {
  it('keeps the full product, its category and drops duplicates', () => {
    const rows = flattenCatalogProducts([
      { id: 1, name: 'Cars', products: [{ id: 10, name: 'G-Class', price: 9, data: { available_units: 5 } }], children_recursive: [{ id: 2, name: 'SUV', products: [{ id: 11, name: 'X5' }, { id: 10, name: 'G-Class' }] }] },
      { id: 30, name: 'Loose', price: 5, category_id: 9 },
    ])
    expect(rows.map((row) => row.id)).toEqual(['10', '11', '30'])
    expect(rows[0]).toMatchObject({ categoryName: 'Cars', price: 9, data: { available_units: 5 } })
    expect(rows[1].categoryName).toBe('SUV')
  })
})
