import { describe, expect, it } from 'vitest'
import { buildProductsReport, flattenCatalog } from './productsReportModel'

const catalog = [
  {
    id: 1,
    name: 'Software',
    type: 'product',
    products: [
      { id: 10, name: 'CRM', price: 100, status: 1 },
      { id: 11, name: 'Old', price: 50, status: 0 },
    ],
    children_recursive: [
      { id: 2, name: 'Support', type: 'service', products: [{ id: 20, name: 'Setup', price: 10 }] },
    ],
  },
  { id: 30, name: 'Loose item', price: 5, category_id: 9, type: 'product' },
]

describe('flattenCatalog', () => {
  it('flattens nested products, inherits type and category, keeps loose products', () => {
    const rows = flattenCatalog(catalog)
    expect(rows.map((row) => row.id)).toEqual([10, 11, 20, 30])
    expect(rows[0]).toMatchObject({ category: 'Software', type: 'product', active: true })
    expect(rows[1].active).toBe(false)
    expect(rows[2]).toMatchObject({ category: 'Support', type: 'service' })
    expect(rows[3].category).toBe('')
  })
})

describe('buildProductsReport', () => {
  it('counts totals, statuses, categories and types', () => {
    const report = buildProductsReport(flattenCatalog(catalog), 'all')
    expect(report).toMatchObject({ total: 4, active: 3, inactive: 1, categories: 2 })
    expect(report.byType[0]).toEqual({ key: 'product', value: 3 })
    expect(report.byCategory[0]).toEqual({ key: 'Software', value: 2 })
  })
})
