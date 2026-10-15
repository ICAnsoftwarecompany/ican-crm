import { describe, expect, it } from 'vitest'
import { countCategoriesByType } from './categoryCounts'

describe('countCategoriesByType', () => {
  it('counts active categories per type (no type = product)', () => {
    expect(countCategoriesByType([{ type: 'product' }, { type: 'service' }, {}, { type: 'service', status: 0 }])).toEqual({ product: 2, service: 1 })
    expect(countCategoriesByType()).toEqual({ product: 0, service: 0 })
  })
})
