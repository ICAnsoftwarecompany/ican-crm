import { describe, expect, it } from 'vitest'
import { buildDealQuickInfo, getMissingQuickInfo, readListSummary, resolveLastAction, summarizeDealsSetup } from './dealQuickInfo'

const deal = { id: 1, created_at: '2026-10-01T08:00:00Z', updated_at: '2026-10-01T08:00:00Z' }

describe('readListSummary / getMissingQuickInfo', () => {
  it('uses counts and last activity when the list sends them', () => {
    const row = { ...deal, products_count: 2, team_count: 0, last_activity: { description: 'Lead won', created_at: '2026-10-03', causer: { name: 'Karim' } } }
    expect(readListSummary(row)).toMatchObject({ productsCount: 2, teamCount: 0, lastAction: { type: 'backend', text: 'Lead won', by: 'Karim' } })
    expect(getMissingQuickInfo(row)).toEqual({ products: true, team: false, leads: false })
  })

  it('needs everything when the list row is bare', () => {
    expect(getMissingQuickInfo(deal)).toEqual({ products: true, team: true, leads: true })
  })

  it('takes embedded product rows (with nested product) as the products', () => {
    const row = { ...deal, products: [{ id: 5, product: { id: 9, name: 'Villa', unit_mode: 'unique' } }] }
    expect(getMissingQuickInfo(row).products).toBe(false)
    expect(buildDealQuickInfo({ deal: row })).toMatchObject({ productsCount: 1, productMode: 'single_unit', hasProducts: true })
  })
})

describe('resolveLastAction', () => {
  it('returns the latest event, preferring a closing on a tie', () => {
    const leads = [
      { name: 'Ahmed', status: 'open', createdAt: '2026-10-02T10:00:00Z' },
      { name: 'Mona', status: 'won', createdAt: '2026-10-01T09:00:00Z', won_at: '2026-10-03T12:00:00Z', updated_at: '2026-10-03T12:00:00Z' },
    ]
    expect(resolveLastAction(deal, leads)).toEqual({ type: 'leadWon', at: '2026-10-03T12:00:00Z', name: 'Mona' })
  })

  it('falls back to the deal dates, and null when nothing is dated', () => {
    expect(resolveLastAction({ ...deal, updated_at: '2026-10-02T08:00:00Z' }, [])).toMatchObject({ type: 'dealUpdated' })
    expect(resolveLastAction(deal, [])).toMatchObject({ type: 'dealCreated' })
    expect(resolveLastAction({}, [])).toBeNull()
  })
})

describe('buildDealQuickInfo', () => {
  it('stays unknown (null) while data is loading', () => {
    expect(buildDealQuickInfo({ deal })).toMatchObject({ productsCount: null, teamCount: null, lastAction: null, hasProducts: null, hasTeam: null, productMode: null })
  })

  it('derives from fetched products, team and leads', () => {
    const info = buildDealQuickInfo({ deal, products: [{ id: 1, available_units: 5 }], team: [], leads: [] })
    expect(info).toMatchObject({ productsCount: 1, productMode: 'single_product', teamCount: 0, hasTeam: false, lastAction: { type: 'dealCreated' } })
  })
})

describe('summarizeDealsSetup', () => {
  it('counts ready / missing products / missing team and skips unknown rows', () => {
    const infos = [
      { hasProducts: true, hasTeam: true },
      { hasProducts: false, hasTeam: true },
      { hasProducts: false, hasTeam: false },
      { hasProducts: null, hasTeam: true },
    ]
    expect(summarizeDealsSetup(infos)).toEqual({ ready: 1, noProducts: 2, noTeam: 1 })
  })
})
