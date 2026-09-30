import { describe, expect, it } from 'vitest'
import { PIPELINE_CARD_FIELDS } from '../constants'
import { getDefaultCardFields, moveCardField, normalizeCardFields, toggleCardField } from './pipelineCardFields'

describe('pipeline card fields', () => {
  it('falls back to defaults for missing or invalid settings', () => {
    expect(normalizeCardFields(null)).toEqual(getDefaultCardFields())
    expect(normalizeCardFields('x')).toHaveLength(PIPELINE_CARD_FIELDS.length)
  })

  it('keeps stored order/visibility, drops unknown ids and appends new fields', () => {
    const fields = normalizeCardFields([
      { id: 'email', visible: true },
      { id: 'removed-field', visible: true },
      { id: 'phone', visible: false },
      { id: 'email', visible: false },
    ])
    expect(fields.slice(0, 2)).toEqual([{ id: 'email', visible: true }, { id: 'phone', visible: false }])
    expect(fields).toHaveLength(PIPELINE_CARD_FIELDS.length)
    expect(fields.find((field) => field.id === 'latestNote')).toEqual({ id: 'latestNote', visible: true })
  })

  it('toggles and moves fields without mutating', () => {
    const fields = getDefaultCardFields()
    const toggled = toggleCardField(fields, 'phone')
    expect(toggled[0]).toEqual({ id: 'phone', visible: false })
    expect(fields[0].visible).toBe(true)

    const moved = moveCardField(fields, 'source', -1)
    expect(moved.slice(0, 2).map((field) => field.id)).toEqual(['source', 'phone'])
    expect(moveCardField(fields, 'phone', -1)).toBe(fields)
  })
})
