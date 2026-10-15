import { normalizeId } from '../../utils/teamModel'

/**
 * Chat distribution model (2026-10-16): who gets new WhatsApp / Messenger chats.
 * - Settings (one per channel): `{ channel, identifier, strategy, fallback_strategy, active }`.
 * - User rules: `{ channel, identifier, user_id, priority, active }`; priority = order (1 first), unique per channel
 *   and identifier. Edit sends `{ priority, active }`.
 * Pure helpers, no React.
 */

export const CHANNELS = [
  { id: 'whatsapp', live: true },
  { id: 'messenger', live: true },
  { id: 'instagram', live: false },
  { id: 'tiktok', live: false },
  { id: 'gmail', live: false },
  { id: 'snapchat', live: false },
]
export const LIVE_CHANNELS = CHANNELS.filter((channel) => channel.live).map((channel) => channel.id)
export const STRATEGIES = ['round_robin_all', 'round_robin_online', 'working_hours']
export const FALLBACK_STRATEGIES = ['round_robin_all', 'round_robin_online', 'unassigned']

const toBool = (value) => {
  if (value === undefined || value === null || value === '') return true
  if (typeof value === 'string') return !['0', 'false'].includes(value.toLowerCase())
  return Boolean(Number(value))
}
const identifierOf = (value) => (value === undefined || value === null || value === '' ? '' : String(value))

export function normalizeSetting(raw = {}) {
  return {
    id: normalizeId(raw.id),
    channel: String(raw.channel || ''),
    identifier: identifierOf(raw.identifier),
    strategy: STRATEGIES.includes(raw.strategy) ? raw.strategy : 'round_robin_all',
    fallbackStrategy: FALLBACK_STRATEGIES.includes(raw.fallback_strategy) ? raw.fallback_strategy : 'unassigned',
    active: toBool(raw.active),
  }
}

/** The channel-wide setting (no identifier) first, else the first one for that channel. */
export function settingForChannel(settings = [], channel) {
  const list = settings.filter((setting) => setting.channel === channel)
  return list.find((setting) => !setting.identifier) || list[0] || null
}

export const toSettingForm = (setting) => ({
  strategy: setting?.strategy || 'round_robin_online',
  fallbackStrategy: setting?.fallbackStrategy || 'round_robin_all',
  active: setting ? setting.active : true,
})

export function buildSettingPayload(channel, form, identifier = '') {
  return { channel, identifier: identifier || null, strategy: form.strategy, fallback_strategy: form.fallbackStrategy, active: Boolean(form.active) }
}

export function normalizeChannelRule(raw = {}) {
  const user = raw.user && typeof raw.user === 'object' ? raw.user : null
  const priority = Number(raw.priority)
  return {
    id: normalizeId(raw.id),
    channel: String(raw.channel || ''),
    identifier: identifierOf(raw.identifier),
    userId: normalizeId(raw.user_id ?? user?.id),
    userName: user?.name || raw.user_name || '',
    priority: Number.isFinite(priority) ? priority : 0,
    active: toBool(raw.active),
  }
}

/** Rules of one channel by priority (1 first), then by id. */
export function rulesForChannel(rules = [], channel) {
  return rules.filter((rule) => rule.channel === channel).sort((a, b) => a.priority - b.priority || Number(a.id) - Number(b.id))
}

/** Priority is unique per channel + identifier ("" = all pages / numbers). */
const sameScope = (rule, channel, identifier) => rule.channel === channel && rule.identifier === (identifier || '')

export function priorityTakenBy(rules = [], { channel, identifier = '', priority, exceptId = '' }) {
  return rules.find((rule) => sameScope(rule, channel, identifier) && rule.priority === Number(priority) && rule.id !== exceptId) || null
}

export function nextChannelPriority(rules = [], channel, identifier = '') {
  return rules.filter((rule) => sameScope(rule, channel, identifier)).reduce((max, rule) => Math.max(max, rule.priority), 0) + 1
}

/** Users that already have a rule for this channel + identifier (to avoid duplicates). */
export function usersWithRule(rules = [], channel, identifier = '') {
  return new Set(rules.filter((rule) => sameScope(rule, channel, identifier)).map((rule) => rule.userId))
}

export const EMPTY_CHANNEL_RULE = { identifier: '', user_id: '', priority: '', active: true }

export function validateChannelRule(form, rules, channel, exceptId = '') {
  const errors = {}
  if (!normalizeId(form.user_id) && !exceptId) errors.user_id = 'userRequired'
  const priority = Number(form.priority)
  if (String(form.priority).trim() === '' || !Number.isInteger(priority) || priority < 1) errors.priority = 'channelPriorityInvalid'
  else if (priorityTakenBy(rules, { channel, identifier: form.identifier, priority, exceptId })) errors.priority = 'priorityTaken'
  if (!exceptId && normalizeId(form.user_id) && usersWithRule(rules, channel, form.identifier).has(normalizeId(form.user_id))) errors.user_id = 'userHasRule'
  return errors
}

export function buildChannelRulePayload(channel, form) {
  return { channel, identifier: form.identifier || null, user_id: Number(form.user_id), priority: Number(form.priority), active: Boolean(form.active) }
}

export const buildChannelRuleUpdate = (form) => ({ priority: Number(form.priority), active: Boolean(form.active) })

/**
 * Pages (Messenger) and numbers (WhatsApp) from the Meta integrations payload, as identifier options.
 * Shapes vary: `facebook_pages[]` (page_id | id, name | page_name) and `whatsapp` (array or { phone_numbers }).
 */
export function identifierOptions(integrations, channel) {
  if (!integrations) return []
  if (channel === 'messenger') {
    const pages = integrations.facebook_pages || integrations.pages || []
    return (Array.isArray(pages) ? pages : []).map((page) => ({ value: String(page.page_id || page.id || ''), label: page.name || page.page_name || String(page.page_id || page.id) })).filter((option) => option.value)
  }
  if (channel === 'whatsapp') {
    const raw = integrations.whatsapp
    const list = Array.isArray(raw) ? raw : raw?.phone_numbers || raw?.numbers || (raw?.phone_number_id || raw?.phone_number ? [raw] : [])
    return list.map((number) => ({
      value: String(number.phone_number_id || number.id || number.phone_number || ''),
      label: [number.verified_name || number.name, number.display_phone_number || number.phone_number].filter(Boolean).join(' · ') || String(number.phone_number_id || number.id),
    })).filter((option) => option.value)
  }
  return []
}
