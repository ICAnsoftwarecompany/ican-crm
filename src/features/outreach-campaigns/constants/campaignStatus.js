/**
 * Central status → UI mapping for outreach campaigns.
 *
 * The current backend (see features/MessegeCampaign/CodeA1_API_BackEndDocumentation.md)
 * documents no response examples, so the real set of status strings it
 * returns is unconfirmed. This map covers the conceptual statuses named in
 * the product spec (draft/scheduled/running/completed/cancelled/failed) and
 * MUST fall back gracefully for anything else instead of crashing — see
 * `getCampaignStatusConfig`.
 *
 * @typedef {Object} CampaignStatusConfig
 * @property {string} labelKey - i18n key for the status label.
 * @property {'neutral'|'info'|'warning'|'success'|'danger'} tone - Drives CampaignStatusBadge color.
 * @property {boolean} canEdit
 * @property {boolean} canCancel
 * @property {boolean} canDelete
 */

/** @type {Record<string, CampaignStatusConfig>} */
export const CAMPAIGN_STATUS_CONFIG = {
  draft: {
    labelKey: 'outreachCampaigns.status.draft',
    tone: 'neutral',
    canEdit: true,
    canCancel: false,
    canDelete: true,
  },
  scheduled: {
    labelKey: 'outreachCampaigns.status.scheduled',
    tone: 'info',
    canEdit: true,
    canCancel: true,
    canDelete: true,
  },
  running: {
    labelKey: 'outreachCampaigns.status.running',
    tone: 'warning',
    canEdit: false,
    canCancel: true,
    canDelete: false,
  },
  completed: {
    labelKey: 'outreachCampaigns.status.completed',
    tone: 'success',
    canEdit: false,
    canCancel: false,
    canDelete: false,
  },
  cancelled: {
    labelKey: 'outreachCampaigns.status.cancelled',
    tone: 'neutral',
    canEdit: false,
    canCancel: false,
    canDelete: true,
  },
  failed: {
    labelKey: 'outreachCampaigns.status.failed',
    tone: 'danger',
    canEdit: true,
    canCancel: false,
    canDelete: true,
  },
}

const FALLBACK_STATUS_CONFIG = {
  labelKey: null, // caller falls back to the raw value string
  tone: 'neutral',
  canEdit: false,
  canCancel: true,
  canDelete: true,
}

export function getCampaignStatusConfig(status) {
  const key = String(status || '').toLowerCase().trim()
  return CAMPAIGN_STATUS_CONFIG[key] || FALLBACK_STATUS_CONFIG
}

export const CAMPAIGN_STATUS_FILTER_OPTIONS = Object.keys(CAMPAIGN_STATUS_CONFIG).map((key) => ({
  value: key,
  labelKey: CAMPAIGN_STATUS_CONFIG[key].labelKey,
}))
