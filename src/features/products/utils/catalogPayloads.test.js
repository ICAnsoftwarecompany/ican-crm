import { describe, expect, it } from 'vitest'
import { buildProductUpdateFormData, buildProductsFormData, compactBody, getCreatedId, toBoolFlag } from './catalogPayloads'

const entries = (formData) => Object.fromEntries([...formData.entries()])

describe('buildProductsFormData', () => {
  it('uses the collection field names, nested units and JSON strings', () => {
    const body = entries(buildProductsFormData([{
      name: 'AC',
      price: 15000,
      kind: 'product',
      item_type_id: 7,
      description: 'Split',
      is_stock_tracked: true,
      stock_quantity: 25,
      capability_values: { warranty: { months: 36 } },
      units: [{ unit_id: 3, factor: 10, price: 140000, barcode: '622', is_default: false }],
    }]))

    expect(body).toEqual({
      'products[0][name]': 'AC',
      'products[0][price]': '15000',
      'products[0][kind]': 'product',
      'products[0][item_type_id]': '7',
      'products[0][description]': 'Split',
      'products[0][is_stock_tracked]': '1',
      'products[0][stock_quantity]': '25',
      'products[0][capability_values]': '{"warranty":{"months":36}}',
      'products[0][units][0][unit_id]': '3',
      'products[0][units][0][factor]': '10',
      'products[0][units][0][price]': '140000',
      'products[0][units][0][barcode]': '622',
      'products[0][units][0][is_default]': '0',
    })
  })

  it('skips empty values, empty objects and units without unit_id', () => {
    const body = entries(buildProductsFormData({ name: 'X', price: '', capability_values: {}, units: [{ factor: 2 }] }))
    expect(body).toEqual({ 'products[0][name]': 'X' })
  })
})

describe('buildProductUpdateFormData', () => {
  it('sends flat names and never sends kind', () => {
    const body = entries(buildProductUpdateFormData({ name: 'AC', kind: 'service', status: true, stock_quantity: 30.5 }))
    expect(body).toEqual({ name: 'AC', status: '1', stock_quantity: '30.5' })
  })
})

describe('helpers', () => {
  it('maps booleans to 1/0', () => {
    expect([true, 1, '1', 'true', false, 0, null].map(toBoolFlag)).toEqual(['1', '1', '1', '1', '0', '0', '0'])
  })

  it('compacts blanks but keeps false and 0', () => {
    expect(compactBody({ a: '', b: null, c: false, d: 0, e: 'x' })).toEqual({ c: false, d: 0, e: 'x' })
  })

  it('reads created ids from both response shapes', () => {
    expect(getCreatedId({ data: { id: 5 } })).toBe(5)
    expect(getCreatedId({ data: [{ id: 9 }] })).toBe(9)
    expect(getCreatedId({ success: true })).toBe(null)
  })
})
