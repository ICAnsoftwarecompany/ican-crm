export const CAMPAIGN_CAPABILITIES = Object.freeze({
  OVERVIEW: 'overview',
  CREATE: 'create_campaign',
  LIST: 'campaign_list',
  DETAILS: 'campaign_details',
  EDIT: 'campaign_edit',
  PAUSE: 'campaign_pause',
  ACTIVATE: 'campaign_activate',
  DUPLICATE: 'campaign_duplicate',
  ANALYTICS: 'analytics',
  BILLING: 'billing',
  WALLET: 'wallet',
  AD_SETS: 'ad_sets',
  ADS: 'ads',
  POSTS: 'posts',
})

export const CAMPAIGN_NAV_ITEMS = [
  { id: 'overview', capability: CAMPAIGN_CAPABILITIES.OVERVIEW, permission: 'campaign.view', labelKey: 'campaigns.center.nav.overview', path: '' },
  { id: 'create', capability: CAMPAIGN_CAPABILITIES.CREATE, permission: 'campaign.create', labelKey: 'campaigns.center.nav.create', path: 'create' },
  { id: 'list', capability: CAMPAIGN_CAPABILITIES.LIST, permission: 'campaign.view', labelKey: 'campaigns.center.nav.list', path: 'list' },
  { id: 'analytics', capability: CAMPAIGN_CAPABILITIES.ANALYTICS, permission: 'campaign.analytics', labelKey: 'campaigns.center.nav.analytics', path: 'analytics' },
  { id: 'billing', capability: CAMPAIGN_CAPABILITIES.BILLING, permission: 'campaign.billing', labelKey: 'campaigns.center.nav.billing', path: 'billing' },
]
