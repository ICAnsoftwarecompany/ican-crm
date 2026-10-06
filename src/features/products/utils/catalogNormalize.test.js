import { describe, expect, it } from 'vitest'
import {
  daysUntil,
  flattenCatalogResponse,
  getProductKind,
  instanceLabel,
  isActiveStatus,
  normalizeCapabilities,
  normalizeCatalogProduct,
  normalizeInstance,
  normalizeItemType,
} from './catalogNormalize'

describe('flattenCatalogResponse', () => {
  it('reads the old category tree', () => {
    const rows = flattenCatalogResponse([
      { id: 1, name: 'Devices', type: 'product', products: [{ id: 10, name: 'AC', price: 5 }], children_recursive: [
        { id: 2, name: 'Small', products: [{ id: 11, name: 'Fan', price: 1 }] },
      ] },
    ])
    expect(rows.map((row) => [row.raw.id, row.category.name])).toEqual([[10, 'Devices'], [11, 'Small']])
  })

  it('reads a flat product list and drops duplicates', () => {
    const rows = flattenCatalogResponse([{ id: 10, name: 'AC', kind: 'product', price: 5 }, { id: 10, name: 'AC', price: 5 }])
    expect(rows).toHaveLength(1)
  })

  it('ignores empty categories', () => {
    expect(flattenCatalogResponse([{ id: 1, name: 'Empty', type: 'product' }])).toEqual([])
  })
})

describe('normalizers', () => {
  it('prefers kind over the old type', () => {
    expect(getProductKind({ kind: 'Service' })).toBe('service')
    expect(getProductKind({ type: 'service' })).toBe('service')
    expect(getProductKind({})).toBe('product')
  })

  it('reads status in its different shapes', () => {
    expect([true, 1, '1', 'active', undefined, false, 0, '0'].map(isActiveStatus)).toEqual([true, true, true, true, true, false, false, false])
  })

  it('normalizes capabilities from arrays, strings and maps', () => {
    expect(normalizeCapabilities('[{"code":"warranty","config":{"months":24}}]')).toEqual([{ code: 'warranty', version: 1, config: { months: 24 } }])
    expect(normalizeCapabilities(['unique_unit'])).toEqual([{ code: 'unique_unit', version: 1, config: {} }])
    expect(normalizeCapabilities({ expiry: { alert_days: 60 } })).toEqual([{ code: 'expiry', version: 1, config: { alert_days: 60 } }])
  })

  it('normalizes a product with its item type', () => {
    const product = normalizeCatalogProduct({
      id: 1, name: 'AC', price: '15000', kind: 'product', desc: 'old', is_stock_tracked: 1, stock_quantity: '25',
      capability_values: '{"warranty":{"months":36}}', item_type: { id: 4, name: 'Devices', capabilities: [{ code: 'serial_tracking' }] },
    })
    expect(product).toMatchObject({ price: 15000, description: 'old', isStockTracked: true, stockQuantity: 25, itemTypeId: 4 })
    expect(product.capabilityValues).toEqual({ warranty: { months: 36 } })
    expect(product.itemType.capabilities[0].code).toBe('serial_tracking')
  })

  it('normalizes an item type', () => {
    expect(normalizeItemType({ id: 1, code: 'appliance', name: 'Devices', service_model: 'B', status: false })).toMatchObject({
      kind: 'product', serviceModel: 'B', status: false, capabilities: [],
    })
  })

  it('labels instances by serial, unit attributes or batch', () => {
    expect(instanceLabel(normalizeInstance({ id: 1, serial_number: 'AC1' }))).toBe('AC1')
    expect(instanceLabel(normalizeInstance({ id: 2, unit_attributes: { building: 'B2', floor: 3, unit: 'A-305' } }))).toBe('B2 · 3 · A-305')
    expect(instanceLabel(normalizeInstance({ id: 3, batch_no: 'B-1', expiry_date: '2027-09-01 00:00:00' }))).toBe('B-1')
    expect(normalizeInstance({ id: 3, expiry_date: '2027-09-01 00:00:00' }).expiryDate).toBe('2027-09-01')
  })

  it('marks voided instances', () => {
    expect(normalizeInstance({ id: 1, status: false }).voided).toBe(true)
    expect(normalizeInstance({ id: 1, status: true }).voided).toBe(false)
  })

  it('counts days until a date', () => {
    const now = new Date(2026, 9, 6, 15, 0)
    expect(daysUntil('2026-10-16', now)).toBe(10)
    expect(daysUntil('2026-10-01', now)).toBe(-5)
    expect(daysUntil('', now)).toBe(null)
  })
})
