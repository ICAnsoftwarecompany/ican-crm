import { describe, expect, it } from 'vitest'
import { buildDraftsKey, deleteDraft, duplicateDraft, listDrafts, loadDraft, migrateDraftState, saveDraft } from './wizardDraftsStore'
import { createInitialWizardState } from './initialWizardState'

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
    data,
  }
}

const scope = { tenantId: 't1', platformId: 'meta', accountId: 'a1' }

function draft(name, savedAt) {
  const state = createInitialWizardState()
  return { ...state, campaign: { ...state.campaign, name }, meta: { ...state.meta, lastSavedAt: savedAt } }
}

describe('wizard drafts store', () => {
  it('saves several drafts and lists them newest first', () => {
    const storage = memoryStorage()
    saveDraft(scope, draft('Old', '2026-09-01T00:00:00Z'), storage)
    saveDraft(scope, draft('New', '2026-09-20T00:00:00Z'), storage)
    expect(listDrafts(scope, storage).map((item) => item.name)).toEqual(['New', 'Old'])
  })

  it('isolates drafts per tenant and ad account', () => {
    const storage = memoryStorage()
    saveDraft(scope, draft('Mine', '2026-09-01T00:00:00Z'), storage)
    expect(listDrafts({ ...scope, accountId: 'other' }, storage)).toEqual([])
  })

  it('loads, duplicates and deletes a draft', () => {
    const storage = memoryStorage()
    const original = draft('Leads', '2026-09-01T00:00:00Z')
    saveDraft(scope, original, storage)
    expect(loadDraft(scope, original.draftId, storage).campaign.name).toBe('Leads')

    const copy = duplicateDraft(scope, original.draftId, { copySuffix: ' (copy)' }, storage)
    expect(copy.draftId).not.toBe(original.draftId)
    expect(copy.campaign.name).toBe('Leads (copy)')
    expect(listDrafts(scope, storage)).toHaveLength(2)

    deleteDraft(scope, original.draftId, storage)
    expect(listDrafts(scope, storage).map((item) => item.id)).toEqual([copy.draftId])
  })

  it('migrates the single v1 draft into the new store once', () => {
    const legacyKey = 'ican-campaign-wizard-draft:t1:meta:a1'
    const v1 = {
      objective: 'OUTCOME_LEADS',
      campaign: { name: 'Legacy', pageId: 'p', specialAdCategories: ['CREDIT'], budgetLevel: 'campaign', budgetType: 'daily', budgetAmount: '100', schedule: { startType: 'now', startTime: '', endType: 'never', endTime: '' }, bidStrategy: 'highest_volume', bidAmount: '' },
      adSets: [{ id: 'adset-1', name: 'A', conversionLocation: 'instant_form', audience: { mode: 'advantage', countries: ['EG', 'SA'], ageMin: 18, ageMax: 65 }, ads: [] }],
      meta: { currentStage: 'adSets', lastSavedAt: '2026-09-21T10:00:00.000Z' },
    }
    const storage = memoryStorage({ [legacyKey]: JSON.stringify({ _version: 1, state: v1 }) })
    const [summary] = listDrafts(scope, storage)
    expect(summary.name).toBe('Legacy')
    expect(storage.data.has(legacyKey)).toBe(false)
    expect(storage.data.has(buildDraftsKey(scope))).toBe(true)

    const migrated = loadDraft(scope, summary.id, storage)
    expect(migrated.campaign.specialAdCategories).toEqual(['FINANCIAL_PRODUCTS_SERVICES'])
    expect(migrated.adSets[0].audience.geo.locations.map((item) => item.countryCode)).toEqual(['EG', 'SA'])
    expect(migrated.adSets[0].ads).toHaveLength(1)
  })

  it('fills fields added after a draft was saved', () => {
    const state = createInitialWizardState()
    delete state.leadRouting
    delete state.adSets[0].dayparting
    const migrated = migrateDraftState(state)
    expect(migrated.leadRouting.tagIds).toEqual([])
    expect(migrated.adSets[0].dayparting.enabled).toBe(false)
  })
})
