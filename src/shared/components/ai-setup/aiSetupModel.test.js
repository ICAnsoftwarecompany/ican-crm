import { describe, expect, it } from 'vitest'
import { DEFAULT_AI_SETUP, getAiSetupStorageKey, normalizeAiSetup, toggleCapability } from './aiSetupModel'

describe('normalizeAiSetup', () => {
  it('returns defaults for empty or invalid input', () => {
    expect(normalizeAiSetup()).toEqual(DEFAULT_AI_SETUP)
    expect(normalizeAiSetup('oops')).toEqual(DEFAULT_AI_SETUP)
  })

  it('keeps only capabilities the module offers, without duplicates', () => {
    const result = normalizeAiSetup({ capabilities: ['summary', 'summary', 'removed'] }, ['summary', 'reply'])
    expect(result.capabilities).toEqual(['summary'])
  })

  it('replaces unknown enum values with defaults', () => {
    const result = normalizeAiSetup({ tone: 'angry', language: 'fr', autonomy: 'god-mode' })
    expect(result.tone).toBe('professional')
    expect(result.language).toBe('auto')
    expect(result.autonomy).toBe('suggest')
  })

  it('respects an explicit handoffToHuman=false', () => {
    expect(normalizeAiSetup({ handoffToHuman: false }).handoffToHuman).toBe(false)
  })
})

describe('toggleCapability / getAiSetupStorageKey', () => {
  it('adds and removes a capability', () => {
    expect(toggleCapability(['a'], 'b')).toEqual(['a', 'b'])
    expect(toggleCapability(['a', 'b'], 'a')).toEqual(['b'])
  })

  it('namespaces the storage key by scope', () => {
    expect(getAiSetupStorageKey('calls')).toBe('ican-crm:ai-setup:calls')
  })
})
