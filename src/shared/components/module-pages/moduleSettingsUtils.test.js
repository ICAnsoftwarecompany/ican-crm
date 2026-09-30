import { describe, expect, it } from 'vitest'
import { resolveActiveSectionId } from './moduleSettingsUtils'

describe('resolveActiveSectionId', () => {
  const sections = [{ id: 'general' }, { id: 'users' }]

  it('returns the requested section when it exists', () => {
    expect(resolveActiveSectionId(sections, 'users')).toBe('users')
  })

  it('falls back to the first section for unknown or missing ids', () => {
    expect(resolveActiveSectionId(sections, 'nope')).toBe('general')
    expect(resolveActiveSectionId(sections, null)).toBe('general')
  })

  it('returns null when there are no sections', () => {
    expect(resolveActiveSectionId([], 'general')).toBeNull()
  })
})
