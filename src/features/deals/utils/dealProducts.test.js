import { describe, expect, it } from 'vitest'
import { buildDealProductsPayload, normalizeDealProduct, validProductDetails } from './dealProducts'
import { buildWizardRequests, createWizardState, withWizardDefaults } from './dealWizard'

describe('deal-specific products', () => {
  it('keeps relation identity and arbitrary details separate from catalog data', () => {
    const result = normalizeDealProduct({ id: 3, deal_id: 12, product_id: 1, details: { quantity: 2, unit_price: 750, discount: 50, custom: { package: 'premium' } }, product: { id: 1, name: 'Medicine', price: '15.00' } })
    expect(result).toMatchObject({ id: 1, linkId: 3, dealId: 12, price: 750, catalogPrice: '15.00', details: { quantity: 2, custom: { package: 'premium' } } })
  })
  it('creates one payload per selected product with numeric IDs and preserved details', () => {
    expect(buildDealProductsPayload(['1', '1', '2'], { 1: { quantity: 2, discount: 0 }, 2: { notes: 'Special', package: 'premium' } })).toEqual({ products: [{ product_id: 1, details: { quantity: 2, discount: 0 } }, { product_id: 2, details: { notes: 'Special', package: 'premium' } }] })
  })
  it('migrates old drafts and submits wizard details without repeating deal_id in the body', () => {
    const old = withWizardDefaults({ products: { ids: ['1'] } })
    expect(old.products.details).toEqual({})
    const state = createWizardState()
    state.products = { ids: ['1'], details: { 1: { quantity: 3 } } }
    expect(buildWizardRequests(state).products(12)).toEqual({ products: [{ product_id: 1, details: { quantity: 3 } }] })
  })
  it('rejects invalid numeric details while preserving optional and arbitrary metadata', () => {
    expect(validProductDetails({ quantity: -1 })).toBe(false)
    expect(validProductDetails({ unit_price: 'invalid' })).toBe(false)
    expect(validProductDetails({ quantity: 2, discount: 0, notes: 'Special' })).toBe(true)
    expect(validProductDetails()).toBe(true)
  })
})
