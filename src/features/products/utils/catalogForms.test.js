import { describe, expect, it } from 'vitest'
import {
  EMPTY_PRODUCT_FORM,
  buildInstancesPayload,
  buildProductPayload,
  cleanCapabilityValues,
  parseSerials,
  validateProductForm,
} from './catalogForms'

describe('capability values', () => {
  it('casts by field type and drops empty configs', () => {
    expect(cleanCapabilityValues({
      warranty: { months: '36', starts_from: '', extendable: 'true' },
      serial_tracking: { pattern: '' },
      custom_x: { note: 'keep' },
    })).toEqual({ warranty: { months: 36, extendable: true }, custom_x: { note: 'keep' } })
  })
})

describe('buildProductPayload', () => {
  const form = {
    ...EMPTY_PRODUCT_FORM,
    name: ' AC ',
    price: '15000',
    item_type_id: '4',
    is_stock_tracked: true,
    stock_quantity: '25',
    capability_values: { warranty: { months: '24' } },
    units: [{ unit_id: '3', factor: '10', price: '', barcode: ' 622 ', is_default: false }, { unit_id: '', factor: '' }],
  }

  it('builds a create body with kind and units', () => {
    expect(buildProductPayload(form)).toEqual({
      name: 'AC', price: 15000, item_type_id: '4', status: true, is_stock_tracked: true, stock_quantity: 25,
      capability_values: { warranty: { months: 24 } }, kind: 'product',
      units: [{ unit_id: '3', factor: 10, barcode: '622', is_default: false }],
    })
  })

  it('builds an update body without kind, units or stock when not tracked', () => {
    const body = buildProductPayload({ ...form, is_stock_tracked: false }, { mode: 'update', data: '{"color":"red"}' })
    expect(body).not.toHaveProperty('kind')
    expect(body).not.toHaveProperty('units')
    expect(body).not.toHaveProperty('stock_quantity')
    expect(body.data).toBe('{"color":"red"}')
  })

  it('validates name, numbers and unit factors', () => {
    expect(validateProductForm({ ...form, name: '', price: '-1', units: [{ unit_id: '3', factor: '0' }] })).toEqual({
      name: 'nameRequired', price: 'invalidNumber', 'units.0.factor': 'factorRequired',
    })
  })
})

describe('instances', () => {
  it('parses serials and checks the pattern', () => {
    expect(parseSerials('AC12345678\n AC12345679 ,AC12345678\n\n')).toEqual(['AC12345678', 'AC12345679'])
    expect(buildInstancesPayload('serial', 'AC12345678\nbad', { pattern: '^[A-Z0-9]{8,12}$' })).toEqual({
      instances: [{ serial_number: 'AC12345678' }, { serial_number: 'bad' }], invalid: ['bad'],
    })
  })

  it('builds real-estate and batch instances', () => {
    expect(buildInstancesPayload('unit', [{ building: 'B2', floor: '3', unit: 'A-305' }, { building: '', floor: '', unit: '' }]).instances)
      .toEqual([{ unit_attributes: { building: 'B2', floor: 3, unit: 'A-305' } }])
    expect(buildInstancesPayload('batch', [{ batch_no: 'B-2026-09', expiry_date: '2027-09-01' }]).instances)
      .toEqual([{ batch_no: 'B-2026-09', expiry_date: '2027-09-01' }])
  })
})
