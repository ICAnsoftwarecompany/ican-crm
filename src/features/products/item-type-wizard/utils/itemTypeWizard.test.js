import { describe, expect, it } from 'vitest'
import { ITEM_TYPE_TEMPLATES, getTemplate, templatesForKind } from '../constants/itemTypeTemplates'
import { getCapabilityDefinition } from '../../constants/capabilityRegistry'
import { buildItemTypePayload, itemTypeToForm } from './itemTypeForm'
import { normalizeItemType } from '../../utils/catalogNormalize'
import en from '../../../../locales/en/catalogSetup'
import ar from '../../../../locales/ar/catalogSetup'
import { CAPABILITY_GROUPS } from '../../constants/capabilityRegistry'
import { SERVICE_MODELS, FULFILLMENT_CREATES } from '../../constants/catalogOptions'
import {
  TYPE_STEPS,
  applyTemplate,
  blankFormForKind,
  firstInvalidTypeStep,
  getTypeSteps,
  suggestCode,
  supportsUnits,
  toggleCapability,
  validateTypeStep,
} from './itemTypeWizard'
import { applyTypeDefaults, productRelationsFromType, productUnitsFromType } from './typeDefaults'

const units = [{ id: 3, code: 'box', name: 'Box' }, { id: 4, code: 'hour', name: 'Hour' }]

describe('templates', () => {
  it('cover every kind and only use registry capabilities', () => {
    expect(['product', 'service', 'plan', 'bundle'].every((kind) => templatesForKind(kind).length > 0)).toBe(true)
    ITEM_TYPE_TEMPLATES.forEach((template) => {
      template.capabilities.forEach(({ code }) => expect(getCapabilityDefinition(code), `${template.id}:${code}`).toBeTruthy())
      expect(template.code).toMatch(/^[a-z0-9_]+$/)
    })
    expect(new Set(ITEM_TYPE_TEMPLATES.map((template) => template.id)).size).toBe(ITEM_TYPE_TEMPLATES.length)
  })

  it('applies a template and reports units the tenant does not have', () => {
    const { form, missingUnits } = applyTemplate(getTemplate('medicine'), { name: 'Medicine', units })
    expect(form).toMatchObject({ kind: 'product', code: 'medicine', service_model: 'A', fulfillment_creates: '', template_id: 'medicine' })
    expect(form.capabilities.map((capability) => capability.code)).toEqual(['barcode', 'batch_lot', 'expiry'])
    expect(form.units).toMatchObject([{ unit_id: '3', factor: '10' }])
    expect(missingUnits).toEqual([])
    expect(applyTemplate(getTemplate('grocery'), { units }).missingUnits).toEqual([{ code: 'carton', factor: 24 }])
  })
})

describe('steps', () => {
  it('skips units for unique units, services, plans and bundles, and kind on edit', () => {
    const appliance = applyTemplate(getTemplate('appliance'), { units }).form
    expect(getTypeSteps(appliance)).toEqual(['kind', 'basics', 'capabilities', 'units', 'relations', 'review'])
    expect(getTypeSteps(applyTemplate(getTemplate('realEstate')).form)).not.toContain('units')
    expect(supportsUnits(blankFormForKind('plan'))).toBe(false)
    expect(supportsUnits(blankFormForKind('service'))).toBe(false)
    expect(templatesForKind('service').every((template) => !template.units)).toBe(true)
    expect(getTypeSteps(appliance, { mode: 'edit' })[0]).toBe('basics')
  })

  it('clears units when a unique unit is turned on', () => {
    const form = { ...blankFormForKind('product'), units: [{ key: 'u', unit_id: '3', factor: '10' }] }
    expect(toggleCapability(form, 'unique_unit', true).units).toEqual([])
    expect(toggleCapability(form, 'barcode', true).units).toHaveLength(1)
  })

  it('validates each step', () => {
    const form = { ...blankFormForKind('product'), name: '', code: 'Bad' }
    expect(validateTypeStep('basics', form)).toEqual({ name: 'nameRequired', code: 'codeFormat' })
    const withConflict = toggleCapability(toggleCapability(form, 'serial_tracking', true), 'unique_unit', true)
    expect(validateTypeStep('capabilities', withConflict).conflicts).toEqual([['serial_tracking', 'unique_unit']])
    expect(validateTypeStep('units', { ...form, units: [{ key: 'a', unit_id: '3', factor: '0' }] })).toEqual({ 'units.a': 'factorRequired' })
    expect(firstInvalidTypeStep(form)).toBe('basics')
    expect(suggestCode('Spare Parts 2')).toBe('spare_parts_2')
    expect(suggestCode('قطع غيار')).toBe('')
  })
})

describe('type defaults → payload → product', () => {
  it('stores default units and attached items on the type and copies them into a product', () => {
    const { form } = applyTemplate(getTemplate('appliance'), { name: 'Appliances', units })
    const payload = buildItemTypePayload({
      ...form,
      units: [{ key: 'u', unit_id: '3', factor: '10', is_default: false }],
      relations: [{ key: 'r', child_product_id: '32', inclusion: 'included', quantity: '1', price_override: '0', auto_add: true }],
      fulfillment_extra: { default_team_id: 7 },
    })
    expect(payload.capabilities.at(-1)).toEqual({ code: 'units', version: 1, config: { alternatives: [{ unit_id: '3', factor: 10, is_default: false }] } })
    expect(payload.fulfillment_config).toEqual({
      default_team_id: 7,
      creates: 'asset',
      default_relations: [{ child_product_id: '32', inclusion: 'included', quantity: 1, price_override: 0, auto_add: true, sort_order: 1 }],
    })

    const saved = normalizeItemType({ id: 4, ...payload })
    const back = itemTypeToForm(saved)
    expect(back.units).toMatchObject([{ unit_id: '3', factor: 10 }])
    expect(back.relations).toMatchObject([{ child_product_id: '32', inclusion: 'included' }])
    expect(back.capabilities.some((capability) => capability.code === 'units')).toBe(false)
    expect(back.fulfillment_extra).toEqual({ default_team_id: 7 })

    expect(productUnitsFromType(saved)).toMatchObject([{ unit_id: '3', factor: '10', price: '' }])
    expect(productRelationsFromType(saved)).toMatchObject([{ child_product_id: '32', quantity: '1', price_override: '0', auto_add: true }])
  })
})

describe('applyTypeDefaults', () => {
  const typeA = { id: 1, name: 'A', capabilities: [{ code: 'units', config: { alternatives: [{ unit_id: 3, factor: 10, is_default: true }] } }], fulfillmentConfig: { default_relations: [{ child_product_id: 9, inclusion: 'included', quantity: 1 }] } }
  const typeB = { id: 2, name: 'B', capabilities: [], fulfillmentConfig: {} }

  it('fills empty rows, then replaces untouched rows when the type changes', () => {
    const first = applyTypeDefaults({ units: [], relations: [] }, typeA, {})
    expect(first.units).toHaveLength(1)
    expect(first.relations[0].child_product_id).toBe('9')
    expect(first.applied).toEqual({ units: 1, relations: 1 })
    const again = applyTypeDefaults({ units: first.units, relations: first.relations }, typeA, first.memo)
    expect(again.units).toBeUndefined()
    const switched = applyTypeDefaults({ units: first.units, relations: first.relations }, typeB, first.memo)
    expect(switched.units).toEqual([])
    expect(switched.relations).toEqual([])
  })

  it('never replaces rows the user edited', () => {
    const first = applyTypeDefaults({ units: [], relations: [] }, typeA, {})
    const edited = [{ ...first.units[0], price: '50' }]
    const result = applyTypeDefaults({ units: edited, relations: [] }, typeB, first.memo)
    expect(result.units).toBeUndefined()
  })
})

describe('translations', () => {
  const has = (dict, path) => path.split('.').reduce((node, key) => (node == null ? undefined : node[key]), dict)
  const keys = [
    ...ITEM_TYPE_TEMPLATES.flatMap((template) => [`templates.${template.id}.name`, `templates.${template.id}.description`]),
    ...ITEM_TYPE_TEMPLATES.flatMap((template) => (template.units || []).map((unit) => `typeWizard.unitNames.${unit.code}`)),
    ...ITEM_TYPE_TEMPLATES.flatMap((template) => (template.relationHints || []).map((hint) => `typeWizard.relationHints.${hint}.name`)),
    ...TYPE_STEPS.flatMap((step) => [`typeWizard.steps.${step}.title`, `typeWizard.steps.${step}.description`, `typeWizard.steps.${step}.guide.title`, `typeWizard.steps.${step}.guide.text`]),
    ...['product', 'service', 'plan', 'bundle'].flatMap((kind) => ['title', 'description', 'examples', 'help'].map((key) => `typeWizard.kinds.${kind}.${key}`)),
    ...CAPABILITY_GROUPS.flatMap((group) => [`capabilityGroups.${group}.title`, `capabilityGroups.${group}.hint`]),
    ...SERVICE_MODELS.map((code) => `typeWizard.serviceModels.${code}`),
    ...FULFILLMENT_CREATES.map((code) => `typeWizard.creates.${code}`),
  ]

  it('exist in Arabic and English for every template, step, kind and option', () => {
    keys.forEach((key) => {
      expect(typeof has(en, key), `en:${key}`).toBe('string')
      expect(typeof has(ar, key), `ar:${key}`).toBe('string')
    })
  })
})
