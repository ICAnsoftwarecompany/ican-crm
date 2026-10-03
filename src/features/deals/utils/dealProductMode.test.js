import { describe, expect, it } from 'vitest'
import { getLineRules, getProductUnitMode, getProductUnits, isUniqueUnitTaken, resolveDealProductMode } from './dealProductMode'

const villa = { id: 1, name: 'Villa A12', unit_mode: 'unique' }
const cars = { id: 2, name: 'G-Class', data: '{"unit_mode":"units","available_units":5}' }
const consult = { id: 3, name: 'Consultation', type: 'service' }

describe('product unit mode', () => {
  it('reads the explicit mode, JSON data, service type and stock of 1', () => {
    expect(getProductUnitMode(villa)).toBe('unique')
    expect(getProductUnitMode(cars)).toBe('units')
    expect(getProductUnits(cars)).toBe(5)
    expect(getProductUnitMode(consult)).toBe('service')
    expect(getProductUnitMode({ id: 4, stock: 1 })).toBe('unique')
    expect(getProductUnitMode({ id: 5 })).toBe('units')
    expect(getProductUnits({ id: 5 })).toBeNull()
  })
})

describe('deal product mode', () => {
  it('derives the mode from the number and kind of products', () => {
    expect(resolveDealProductMode([])).toBe('open')
    expect(resolveDealProductMode([villa])).toBe('single_unit')
    expect(resolveDealProductMode([cars])).toBe('single_product')
    expect(resolveDealProductMode([consult])).toBe('single_product')
    expect(resolveDealProductMode([villa, cars])).toBe('multi_product')
  })

  it('gives line rules per mode', () => {
    expect(getLineRules('single_unit', [villa])).toMatchObject({ lockedProduct: villa, allowAddLines: false, fixedQuantity: 1 })
    expect(getLineRules('single_product', [cars])).toMatchObject({ lockedProduct: cars, fixedQuantity: null, maxQuantity: 5 })
    expect(getLineRules('single_product', [consult]).maxQuantity).toBeNull()
    expect(getLineRules('multi_product', [villa, cars])).toMatchObject({ lockedProduct: null, allowAddLines: true })
  })

  it('a unique unit can be won once', () => {
    expect(isUniqueUnitTaken('single_unit', [{ status: 'won' }])).toBe(true)
    expect(isUniqueUnitTaken('single_unit', [{ status: 'open' }])).toBe(false)
    expect(isUniqueUnitTaken('single_product', [{ status: 'won' }])).toBe(false)
  })
})
