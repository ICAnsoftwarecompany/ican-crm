/**
 * The Facebook campaigns endpoint returns campaigns nested three levels
 * deep (ad account -> page -> campaign), with performance metrics nested
 * again inside `insights.data[0]`. The table/UI needs one flat row per
 * campaign with those metrics lifted to top-level fields.
 */
export function flattenFacebookCampaigns(response) {
  const adAccounts = Array.isArray(response?.ad_accounts) ? response.ad_accounts : []
  const rows = []

  for (const entry of adAccounts) {
    const account = entry?.account || {}
    const pages = Array.isArray(entry?.pages) ? entry.pages : []

    for (const page of pages) {
      const campaigns = Array.isArray(page?.campaigns) ? page.campaigns : []

      for (const campaign of campaigns) {
        const insight = campaign?.insights?.data?.[0] || {}

        rows.push({
          ...campaign,
          account_id: account.account_id || account.id || null,
          account_name: account.name || null,
          account_currency: account.currency || null,
          page_id: page.page_id || null,
          page_name: page.page_name || null,
          impressions: insight.impressions ?? null,
          clicks: insight.clicks ?? null,
          spend: insight.spend ?? null,
          reach: insight.reach ?? null,
          cpc: insight.cpc ?? null,
          cpm: insight.cpm ?? null,
          ctr: insight.ctr ?? null,
          actions: Array.isArray(insight.actions) ? insight.actions : [],
        })
      }
    }
  }

  return rows
}

/**
 * Which raw `actions[].action_type` represents "the result" depends on the
 * campaign objective — this mirrors how Facebook Ads Manager's own
 * "Results" column picks a metric per objective. Listed in priority order
 * per objective since Meta sometimes reports both a raw and de-duplicated
 * ("_grouped") action type for the same outcome.
 */
const OBJECTIVE_RESULT_ACTIONS = {
  OUTCOME_LEADS: ['onsite_conversion.lead_grouped', 'lead', 'onsite_conversion.lead'],
  LEAD_GENERATION: ['onsite_conversion.lead_grouped', 'lead', 'onsite_conversion.lead'],
  OUTCOME_TRAFFIC: ['link_click'],
  LINK_CLICKS: ['link_click'],
  OUTCOME_ENGAGEMENT: ['post_engagement'],
  POST_ENGAGEMENT: ['post_engagement'],
  PAGE_LIKES: ['like'],
  MESSAGES: ['onsite_conversion.total_messaging_connection', 'onsite_conversion.messaging_conversation_started_7d'],
  OUTCOME_APP_PROMOTION: ['mobile_app_install', 'app_install'],
  APP_INSTALLS: ['mobile_app_install', 'app_install'],
  OUTCOME_SALES: ['omni_purchase', 'purchase'],
  CONVERSIONS: ['omni_purchase', 'purchase'],
  VIDEO_VIEWS: ['video_view'],
}

/** Returns the matched result count, or null when the objective has no mapped action (e.g. awareness/reach objectives). */
export function getCampaignResultCount(campaign) {
  const actionTypes = OBJECTIVE_RESULT_ACTIONS[campaign?.objective]
  if (!actionTypes) return null

  const actions = Array.isArray(campaign?.actions) ? campaign.actions : []
  for (const type of actionTypes) {
    const match = actions.find((action) => action.action_type === type)
    if (match) return Number(match.value) || 0
  }

  return null
}
