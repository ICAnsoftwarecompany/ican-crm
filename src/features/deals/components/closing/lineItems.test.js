import { describe, expect, it } from 'vitest'
import { toEditorLines } from './LineItemsEditor'
import { getLineRules } from '../../utils/dealProductMode'

const villa = { id: '1', name: 'Villa', price: 900, unit_mode: 'unique' }
const cars = { id: '2', name: 'G-Class', price: 300, available_units: 5 }

describe('toEditorLines by product mode', () => {
  it('locks one line of the unique product with quantity 1 and its price', () => {
    expect(toEditorLines([], getLineRules('single_unit', [villa]))).toEqual([{ product_id: '1', quantity: 1, unit_price: 900, discount: 0 }])
  })

  it('keeps the saved line of the single product and drops others', () => {
    const rows = [{ product_id: 2, quantity: 3, unit_price: 280, discount: 0 }, { product_id: 9, quantity: 1 }]
    expect(toEditorLines(rows, getLineRules('single_product', [cars]))).toEqual([{ product_id: '2', quantity: 3, unit_price: 280, discount: 0 }])
  })

  it('stays free for several products', () => {
    expect(toEditorLines([], getLineRules('multi_product', [villa, cars]))).toEqual([{ product_id: '', quantity: 1, unit_price: '', discount: 0 }])
  })
})
