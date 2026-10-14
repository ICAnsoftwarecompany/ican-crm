import { describe, expect, it } from 'vitest'
import { productCompleteness } from './productCompleteness'
import { getCompletionSteps, validateCompletionStep } from './completionSteps'

describe('productCompleteness', () => {
  it('scores the six checks and lists what is missing', () => {
    expect(productCompleteness({ name: 'AC', price: 10, itemTypeId: 4, categoryId: 2, description: 'x', image: 'a.png' })).toMatchObject({ score: 100, level: 'complete', missing: [] })
    const partial = productCompleteness({ name: 'AC', price: 0, itemTypeId: null, categoryId: 2, description: '', image: '' })
    expect(partial).toMatchObject({ done: 3, total: 6, score: 50, level: 'low' })
    expect(partial.missing).toEqual(['itemType', 'description', 'image'])
    expect(productCompleteness({ name: 'AC', price: 5, categoryId: 1, itemTypeId: 1 }).level).toBe('good')
  })
})

describe('completion steps', () => {
  it('adds the capability step after a newly chosen type with capabilities', () => {
    expect(getCompletionSteps(['itemType', 'image'])).toEqual(['itemType', 'image', 'review'])
    expect(getCompletionSteps(['itemType', 'image'], { chosenItemType: { capabilities: [{ code: 'warranty' }] } })).toEqual(['itemType', 'capabilities', 'image', 'review'])
    expect(getCompletionSteps(['itemType'], { chosenItemType: { capabilities: [{ code: 'units' }] } })).toEqual(['itemType', 'review'])
  })
  it('only blocks on name and price', () => {
    expect(validateCompletionStep('name', { name: ' ' })).toBe('nameRequired')
    expect(validateCompletionStep('price', { price: '' })).toBe('invalidNumber')
    expect(validateCompletionStep('image', {})).toBeNull()
  })
})

describe('translations', async () => {
  const en = (await import('../../../../locales/en/productDetails')).default
  const ar = (await import('../../../../locales/ar/productDetails')).default
  const { COMPLETENESS_CHECKS } = await import('./productCompleteness')
  const get = (dict, path) => path.split('.').reduce((node, key) => (node == null ? undefined : node[key]), dict)
  const steps = [...COMPLETENESS_CHECKS, 'capabilities', 'review']
  const keys = [
    ...COMPLETENESS_CHECKS.map((key) => `checks.${key}`),
    ...steps.flatMap((step) => ['title', 'description', 'guide.title', 'guide.text'].map((part) => `complete.steps.${step}.${part}`)),
  ]
  it('exist in Arabic and English for every check and completion step', () => {
    keys.forEach((key) => {
      expect(typeof get(en, key), `en:${key}`).toBe('string')
      expect(typeof get(ar, key), `ar:${key}`).toBe('string')
    })
  })
})
