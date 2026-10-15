import { describe, expect, it } from 'vitest'
import {
  buildChannelRulePayload, buildChannelRuleUpdate, buildSettingPayload, identifierOptions, nextChannelPriority, normalizeChannelRule,
  normalizeSetting, priorityTakenBy, rulesForChannel, settingForChannel, toSettingForm, usersWithRule, validateChannelRule,
} from './channelDistributionModel'

const rules = [
  { id: 1, channel: 'messenger', identifier: '1143370238851368', user_id: 2, priority: 1, active: true },
  { id: 2, channel: 'messenger', identifier: '1143370238851368', user_id: 3, priority: 2, active: 0 },
  { id: 3, channel: 'whatsapp', identifier: null, user_id: 2, priority: 1, active: 1, user: { id: 2, name: 'Mona' } },
].map(normalizeChannelRule)

describe('channel distribution settings', () => {
  it('normalizes and finds the channel setting', () => {
    const settings = [
      { id: 5, channel: 'messenger', identifier: 'p1', strategy: 'working_hours', fallback_strategy: 'unassigned', active: 1 },
      { id: 6, channel: 'messenger', identifier: null, strategy: 'round_robin_online', fallback_strategy: 'round_robin_all', active: true },
    ].map(normalizeSetting)
    expect(settingForChannel(settings, 'messenger').id).toBe('6')
    expect(settingForChannel(settings, 'whatsapp')).toBeNull()
    expect(toSettingForm(null)).toEqual({ strategy: 'round_robin_online', fallbackStrategy: 'round_robin_all', active: true })
    expect(buildSettingPayload('messenger', toSettingForm(settings[1]))).toEqual({ channel: 'messenger', identifier: null, strategy: 'round_robin_online', fallback_strategy: 'round_robin_all', active: true })
    expect(normalizeSetting({ strategy: 'x' })).toMatchObject({ strategy: 'round_robin_all', fallbackStrategy: 'unassigned' })
  })
})

describe('channel user rules', () => {
  it('sorts per channel and reads nested users', () => {
    expect(rulesForChannel(rules, 'messenger').map((r) => r.id)).toEqual(['1', '2'])
    expect(rules[2]).toMatchObject({ userId: '2', userName: 'Mona', identifier: '' })
  })

  it('keeps priorities unique per channel and identifier', () => {
    expect(priorityTakenBy(rules, { channel: 'messenger', identifier: '1143370238851368', priority: 2 })?.id).toBe('2')
    expect(priorityTakenBy(rules, { channel: 'messenger', identifier: '', priority: 2 })).toBeNull()
    expect(nextChannelPriority(rules, 'messenger', '1143370238851368')).toBe(3)
    expect(nextChannelPriority(rules, 'whatsapp')).toBe(2)
    expect([...usersWithRule(rules, 'whatsapp')]).toEqual(['2'])
  })

  it('validates a new rule and builds the bodies', () => {
    const form = { identifier: '1143370238851368', user_id: '4', priority: '2', active: true }
    expect(validateChannelRule(form, rules, 'messenger')).toEqual({ priority: 'priorityTaken' })
    expect(validateChannelRule({ ...form, user_id: '2', priority: '3' }, rules, 'messenger')).toEqual({ user_id: 'userHasRule' })
    expect(validateChannelRule({ ...form, user_id: '', priority: '0' }, rules, 'messenger')).toEqual({ user_id: 'userRequired', priority: 'channelPriorityInvalid' })
    expect(validateChannelRule({ ...form, priority: '2' }, rules, 'messenger', '2')).toEqual({})
    expect(buildChannelRulePayload('messenger', { ...form, priority: '3' })).toEqual({ channel: 'messenger', identifier: '1143370238851368', user_id: 4, priority: 3, active: true })
    expect(buildChannelRuleUpdate({ priority: '3', active: false })).toEqual({ priority: 3, active: false })
  })

  it('reads pages and WhatsApp numbers from the integrations payload', () => {
    const integrations = {
      facebook_pages: [{ page_id: '1143370238851368', name: 'ICAN' }],
      whatsapp: { phone_numbers: [{ phone_number_id: '55', display_phone_number: '+20 100', verified_name: 'ICAN WA' }] },
    }
    expect(identifierOptions(integrations, 'messenger')).toEqual([{ value: '1143370238851368', label: 'ICAN' }])
    expect(identifierOptions(integrations, 'whatsapp')).toEqual([{ value: '55', label: 'ICAN WA · +20 100' }])
    expect(identifierOptions(null, 'whatsapp')).toEqual([])
  })
})
