import { describe, expect, it } from 'vitest'
import { applyPreset, capabilitiesForKind, requiredByOthers, toggleCapability } from './capabilities'

const registry = [
  { code: 'batch_lot', version: 1, applies_to: 'product', config_fields: [] },
  { code: 'expiry', version: 1, applies_to: 'product', depends_on: ['batch_lot'], config_fields: [{ key: 'alert_days', default: 60 }] },
  { code: 'scheduling', version: 1, applies_to: 'service', config_fields: [] },
  { code: 'warranty', version: 1, applies_to: 'both', config_fields: [{ key: 'months', default: 12 }] },
]

describe('capability helpers', () => {
  it('filters by kind', () => {
    expect(capabilitiesForKind(registry, 'service').map((entry) => entry.code)).toEqual(['scheduling', 'warranty'])
    expect(capabilitiesForKind(registry, 'plan').map((entry) => entry.code)).toEqual(['scheduling', 'warranty'])
    expect(capabilitiesForKind(registry, 'bundle')).toHaveLength(4)
  })

  it('enables dependencies with defaults and reports them as required', () => {
    const selected = toggleCapability([], registry, 'expiry', true)
    expect(selected.map((entry) => entry.code)).toEqual(['batch_lot', 'expiry'])
    expect(selected[1].config).toEqual({ alert_days: 60 })
    expect(requiredByOthers(selected, registry).has('batch_lot')).toBe(true)
    expect(toggleCapability(selected, registry, 'expiry', false).map((entry) => entry.code)).toEqual(['batch_lot'])
  })

  it('applies a preset keeping existing configs', () => {
    const selected = [{ code: 'warranty', version: 1, config: { months: 24 } }]
    const next = applyPreset(selected, registry, { capabilities: ['warranty', 'scheduling'] })
    expect(next.find((entry) => entry.code === 'warranty').config.months).toBe(24)
    expect(next.map((entry) => entry.code).sort()).toEqual(['scheduling', 'warranty'])
  })
})
