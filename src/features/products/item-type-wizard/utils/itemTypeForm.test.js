import { describe, expect, it } from 'vitest'
import { buildItemTypePayload, itemTypeToForm, validateItemTypeForm } from './itemTypeForm'
import { normalizeItemType } from '../../utils/catalogNormalize'

describe('item types', () => {
  it('round-trips an item type into a request body', () => {
    const form = itemTypeToForm(normalizeItemType({
      id: 1, code: 'appliance', name: 'Devices', kind: 'product', service_model: 'B',
      capabilities: [{ code: 'warranty', version: 1, config: { months: 24, starts_from: 'installation' } }, { code: 'custom_x', config: { a: 1 } }],
      fulfillment_config: { creates: 'asset' }, status: true,
    }))
    expect(buildItemTypePayload(form, { mode: 'update' })).toEqual({
      name: 'Devices', kind: 'product', service_model: 'B', fulfillment_config: { creates: 'asset' }, status: true,
      capabilities: [
        { code: 'warranty', version: 1, config: { months: 24, starts_from: 'installation' } },
        { code: 'custom_x', version: 1, config: { a: 1 } },
      ],
    })
    expect(buildItemTypePayload(form).code).toBe('appliance')
  })

  it('validates the code and custom JSON', () => {
    const errors = validateItemTypeForm({ ...itemTypeToForm(null), code: 'Bad Code', name: '', capabilities: [{ code: 'x', configJson: '{bad' }] })
    expect(errors).toEqual({ code: 'codeFormat', name: 'nameRequired', 'capabilities.0': 'invalidJson' })
  })
})
