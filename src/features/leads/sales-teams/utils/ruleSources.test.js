import { describe, expect, it } from 'vitest'
import { extractRows, filterOptions, isMetaCampaign, statusOf, toAdOptions, toCampaignOptions, toFormOptions } from './ruleSources'
import { findCreatedTeamId } from './teamModel'

describe('ruleSources', () => {
  it('finds rows in any response shape', () => {
    expect(extractRows({ data: [{ id: 1 }] })).toEqual([{ id: 1 }])
    expect(extractRows({ status: true, result: { campaigns: { list: [{ id: 2, name: 'A' }] } } })).toEqual([{ id: 2, name: 'A' }])
    expect(extractRows({ status: true })).toEqual([])
  })

  it('reads statuses', () => {
    expect(statusOf({ effective_status: 'ACTIVE' })).toBe('active')
    expect(statusOf({ status: 'PAUSED' })).toBe('paused')
    expect(statusOf({ active: 0 })).toBe('paused')
    expect(statusOf({})).toBe('')
  })

  it('merges CRM and Meta campaigns, preferring the Meta row, and keeps stored ids', () => {
    const options = toCampaignOptions({
      crm: [{ id: 1, name: 'Ramadan' }, { id: 3, name: 'Offline' }],
      meta: [{ id: 1, name: 'Ramadan', status: 'ACTIVE', page_name: 'ICAN', account_name: 'Main' }],
    }, ['9'])
    expect(options.map((o) => [o.value, o.platform])).toEqual([['1', 'meta'], ['3', 'crm'], ['9', '']])
    expect(options[0]).toMatchObject({ subtitle: 'ICAN · Main', status: 'active' })
    expect(options[2].missing).toBe(true)
    expect(isMetaCampaign(options, '1')).toBe(true)
    expect(filterOptions(options, 'ican').map((o) => o.value)).toEqual(['1'])
  })

  it('narrows CRM ads to the campaign and labels Meta ads with their ad set', () => {
    const options = toAdOptions({
      crm: [{ id: 11, name: 'A', campaign_id: 1 }, { id: 12, name: 'B', campaign_id: 2 }, { id: 13, name: 'C' }],
      metaAdSets: [{ adSet: { id: 5, name: 'Cairo 25-40' }, ads: [{ id: 21, name: 'Video', effective_status: 'PAUSED' }] }],
    }, '1')
    expect(options.map((o) => o.value)).toEqual(['11', '13', '21'])
    expect(options[2]).toMatchObject({ platform: 'meta', subtitle: 'Cairo 25-40', status: 'paused' })
    expect(toAdOptions({ crm: [{ id: 12, campaign_id: 2 }] }).map((o) => o.value)).toEqual(['12'])
  })

  it('builds form options', () => {
    expect(toFormOptions({ crm: [{ id: 7, name: 'VIP', page_id: 'p1', page_name: 'ICAN' }] })[0]).toMatchObject({ value: '7', platform: 'meta', subtitle: 'ICAN' })
  })
})

describe('findCreatedTeamId', () => {
  it('reads the id from the create response or the newest team with that name', () => {
    expect(findCreatedTeamId({ data: { id: 9 } })).toBe('9')
    expect(findCreatedTeamId({ team: { id: 4 } })).toBe('4')
    expect(findCreatedTeamId({ status: true }, [{ id: 3, name: 'A' }, { id: 8, name: 'A ' }, { id: 5, name: 'B' }], 'A')).toBe('8')
    expect(findCreatedTeamId({}, [], 'X')).toBe('')
  })
})
