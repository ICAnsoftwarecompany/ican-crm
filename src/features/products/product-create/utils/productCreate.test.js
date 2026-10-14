import { describe, expect, it } from 'vitest'
import { getCreateSteps } from './createSteps'
import { draftsForKind, removeDraft, toDraft, upsertDraft } from './productDrafts'
import { categoryPath, describeCategory, inheritedFieldNames } from './categoryPath'
import { buildQuickProduct, nextQuickRow, validateQuickRow } from './quickAdd'

const serialType = { id: 4, capabilities: [{ code: 'serial_tracking', config: {} }] }
const uniqueType = { id: 5, capabilities: [{ code: 'unique_unit', config: {} }] }
const plainType = { id: 6, capabilities: [{ code: 'warranty', config: {} }, { code: 'units', config: { alternatives: [{ unit_id: 3, factor: 10 }] } }] }

describe('getCreateSteps', () => {
  it('shows every step without an item type', () => {
    expect(getCreateSteps(null)).toEqual(['basics', 'stock', 'capabilities', 'relations', 'instances', 'review'])
  })
  it('follows the item type', () => {
    expect(getCreateSteps(serialType)).toContain('instances')
    expect(getCreateSteps(plainType)).not.toContain('instances')
    expect(getCreateSteps(uniqueType)).not.toContain('stock')
    expect(getCreateSteps(uniqueType)).toContain('instances')
  })
})

describe('drafts', () => {
  it('drops the image, keeps newest first and filters by kind', () => {
    const draft = toDraft({ id: 'a', kind: 'product', step: 'stock', form: { name: 'AC', image: { name: 'x.png' } } }, 0)
    expect(draft.form.image).toBeUndefined()
    expect(draft.hadImage).toBe(true)
    let list = upsertDraft([], draft)
    list = upsertDraft(list, toDraft({ id: 'b', kind: 'service', step: 'basics', form: { name: 'Visit' } }, 1))
    list = upsertDraft(list, { ...draft, step: 'review' })
    expect(list.map((item) => item.id)).toEqual(['a', 'b'])
    expect(list[0].step).toBe('review')
    expect(draftsForKind(list, 'service').map((item) => item.id)).toEqual(['b'])
    expect(draftsForKind(list, 'product').map((item) => item.id)).toEqual(['a'])
    expect(removeDraft(list, 'a').map((item) => item.id)).toEqual(['b'])
  })
})

describe('category path', () => {
  const tree = [{
    id: 1, name: 'Electronics', data: JSON.stringify([{ brand: '' }]),
    children_recursive: [{ id: 2, name: 'Cooling', desc: 'ACs and fans', children_recursive: [{ id: 3, name: 'Split AC', data: JSON.stringify([{ hp: '', brand: '' }]) }] }],
  }]
  it('returns root to leaf with details and inherited fields', () => {
    const path = categoryPath(tree, '3')
    expect(path.map((category) => category.name)).toEqual(['Electronics', 'Cooling', 'Split AC'])
    expect(describeCategory(path[1])).toMatchObject({ name: 'Cooling', description: 'ACs and fans', childrenCount: 1, active: true })
    expect(inheritedFieldNames(path)).toEqual(['brand', 'hp'])
    expect(categoryPath(tree, '99')).toEqual([])
  })
})

describe('quick add', () => {
  it('validates, builds the create body with the type units and keeps category for the next row', () => {
    expect(validateQuickRow({ name: '', price: '' })).toEqual({ name: 'nameRequired', price: 'invalidNumber' })
    const row = { name: 'Box AC', price: '100', category_id: '2', item_type_id: '6' }
    const body = buildQuickProduct(row, { kind: 'product', itemType: plainType })
    expect(body).toMatchObject({ name: 'Box AC', price: 100, kind: 'product', category_id: '2', item_type_id: '6', status: true })
    expect(body.units).toEqual([{ unit_id: '3', factor: 10, is_default: false }])
    expect(nextQuickRow(row)).toEqual({ name: '', price: '', category_id: '2', item_type_id: '6' })
  })
})

describe('translations', async () => {
  const en = (await import('../../../../locales/en/productSetup')).default
  const ar = (await import('../../../../locales/ar/productSetup')).default
  const { CREATE_STEPS } = await import('../../utils/productCreateWizard')
  const get = (dict, path) => path.split('.').reduce((node, key) => (node == null ? undefined : node[key]), dict)
  const keys = [
    ...CREATE_STEPS.flatMap((step) => [`steps.${step}.guide.title`, `steps.${step}.guide.text`]),
    ...CREATE_STEPS.filter((step) => step !== 'review').flatMap((step) => [`steps.${step}.manual`, `steps.${step}.withType`]),
    ...['name', 'kind', 'itemType', 'price', 'category', 'description', 'image', 'status'].flatMap((key) => [`help.${key}.title`, `help.${key}.text`]),
    ...['serial', 'unit', 'batch'].map((mode) => `instanceModes.${mode}`),
    ...['selected', 'parent', 'ancestor'].map((level) => `category.level.${level}`),
  ]
  it('exist in Arabic and English', () => {
    keys.forEach((key) => {
      expect(typeof get(en, key), `en:${key}`).toBe('string')
      expect(typeof get(ar, key), `ar:${key}`).toBe('string')
    })
  })
})
