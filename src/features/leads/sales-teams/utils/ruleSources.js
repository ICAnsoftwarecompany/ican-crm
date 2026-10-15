import { extractList } from '../../../../shared/utils/apiResponse'
import { normalizeId } from './teamModel'

/**
 * Where a rule's campaign / ad / lead form come from (2026-10-16). Two sources are merged:
 * - CRM lists: `GET /api/tenant/campaigns/active|inactive`, `/ads/active|inactive`, `/ads-forms/active|inactive`.
 * - Meta (Campaign Center): `GET /api/tenant/facebook/campaigns/get` (ad account → page → campaign), then for the
 *   chosen campaign `GET /api/tenant/campaigns/{id}/adsets` and `GET /api/tenant/facebook/campaigns/adsets/{id}/ads`.
 * The rule stores the row `id` of each (to confirm with the backend, BACKEND-REQUESTS E3). Pure helpers, no React.
 */

const looksLikeRow = (item) => item && typeof item === 'object' && ('id' in item || 'name' in item)

/** Any list response → rows (keys first, then the first array of objects found a few levels down). */
export function extractRows(response, keys = []) {
  const direct = extractList(response, keys)
  if (direct.length) return direct
  const seen = new Set()
  const walk = (value, depth) => {
    if (!value || typeof value !== 'object' || depth > 4 || seen.has(value)) return []
    seen.add(value)
    if (Array.isArray(value)) return value.some(looksLikeRow) ? value : []
    for (const child of Object.values(value)) {
      const rows = walk(child, depth + 1)
      if (rows.length) return rows
    }
    return []
  }
  return walk(response, 0)
}

const nameOf = (row) => row?.name || row?.title || row?.campaign_name || row?.ad_name || row?.form_name || row?.adset_name || ''

export function statusOf(row) {
  const raw = String(row?.effective_status || row?.status || row?.configured_status || '').toLowerCase()
  if (row?.active === false || row?.active === 0 || row?.is_active === 0 || row?.is_active === false) return 'paused'
  if (['active', '1', 'true'].includes(raw) || row?.active === true || row?.active === 1) return 'active'
  if (['paused', 'inactive', 'campaign_paused', 'adset_paused', '0', 'false'].includes(raw)) return 'paused'
  if (['archived', 'deleted'].includes(raw)) return 'archived'
  return raw ? 'other' : ''
}

/** Keeps stored ids selectable even when they are no longer listed. */
function withKept(options, keepIds = []) {
  const known = new Set(options.map((option) => option.value))
  const extra = keepIds.map(normalizeId).filter((id) => id && !known.has(id)).map((id) => ({ value: id, label: `#${id}`, platform: '', status: '', subtitle: '', missing: true }))
  return [...options, ...extra]
}

function addUnique(map, option) {
  if (!option.value) return
  const current = map.get(option.value)
  // A Meta row carries more context (page, account, status) than the CRM copy of the same campaign.
  if (!current || (option.platform === 'meta' && current.platform !== 'meta')) map.set(option.value, option)
}

export function toCampaignOptions({ crm = [], meta = [] } = {}, keepIds = []) {
  const map = new Map()
  crm.forEach((row) => addUnique(map, { value: normalizeId(row.id), label: nameOf(row) || `#${row.id}`, platform: 'crm', status: statusOf(row), subtitle: row.platform || row.source || '', campaignId: '' }))
  meta.forEach((row) => addUnique(map, {
    value: normalizeId(row.id),
    label: nameOf(row) || `#${row.id}`,
    platform: 'meta',
    status: statusOf(row),
    subtitle: [row.page_name, row.account_name].filter(Boolean).join(' · '),
    objective: row.objective || '',
  }))
  return withKept([...map.values()], keepIds)
}

/**
 * Ads: CRM ads (narrowed to the chosen campaign when they carry `campaign_id`) + the Meta ads of the chosen
 * campaign's ad sets (`metaAdSets` = [{ adSet, ads }]), labelled with their ad set.
 */
export function toAdOptions({ crm = [], metaAdSets = [] } = {}, campaignId = '', keepIds = []) {
  const map = new Map()
  crm
    .filter((row) => !campaignId || !normalizeId(row.campaign_id ?? row.campaign) || normalizeId(row.campaign_id ?? row.campaign) === campaignId)
    .forEach((row) => addUnique(map, { value: normalizeId(row.id), label: nameOf(row) || `#${row.id}`, platform: 'crm', status: statusOf(row), subtitle: '' }))
  metaAdSets.forEach(({ adSet, ads = [] }) => ads.forEach((row) => addUnique(map, {
    value: normalizeId(row.id),
    label: nameOf(row) || `#${row.id}`,
    platform: 'meta',
    status: statusOf(row),
    subtitle: nameOf(adSet),
  })))
  return withKept([...map.values()], keepIds)
}

export function toFormOptions({ crm = [] } = {}, keepIds = []) {
  const map = new Map()
  crm.forEach((row) => addUnique(map, { value: normalizeId(row.id), label: nameOf(row) || `#${row.id}`, platform: row.page_id || row.form_id ? 'meta' : 'crm', status: statusOf(row), subtitle: row.page_name || '' }))
  return withKept([...map.values()], keepIds)
}

export function filterOptions(options = [], query = '') {
  const needle = query.trim().toLowerCase()
  if (!needle) return options
  return options.filter((option) => [option.label, option.subtitle, option.value].join(' ').toLowerCase().includes(needle))
}

export const isMetaCampaign = (options, campaignId) => options.some((option) => option.value === campaignId && option.platform === 'meta')
