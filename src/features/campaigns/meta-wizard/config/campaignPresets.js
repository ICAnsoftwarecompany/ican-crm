// Quick-start templates. Each one pre-fills the objective and the first ad
// set so a non-expert can build a working campaign in a few clicks; every
// field stays editable afterwards.
export const CAMPAIGN_PRESETS = Object.freeze([
  { id: 'leads_instant_form', objective: 'OUTCOME_LEADS', conversionLocation: 'instant_form', performanceGoal: 'LEAD_GENERATION', icon: 'form', recommended: true },
  { id: 'whatsapp_messages', objective: 'OUTCOME_ENGAGEMENT', conversionLocation: 'whatsapp', performanceGoal: 'CONVERSATIONS', icon: 'whatsapp', recommended: true },
  { id: 'messenger_messages', objective: 'OUTCOME_ENGAGEMENT', conversionLocation: 'messenger', performanceGoal: 'CONVERSATIONS', icon: 'messenger' },
  { id: 'phone_calls', objective: 'OUTCOME_LEADS', conversionLocation: 'phone_call', performanceGoal: 'QUALITY_CALL', icon: 'phone' },
  { id: 'website_leads', objective: 'OUTCOME_LEADS', conversionLocation: 'website', performanceGoal: 'OFFSITE_CONVERSIONS', icon: 'target' },
  { id: 'website_traffic', objective: 'OUTCOME_TRAFFIC', conversionLocation: 'website', performanceGoal: 'LANDING_PAGE_VIEWS', icon: 'click' },
  { id: 'website_sales', objective: 'OUTCOME_SALES', conversionLocation: 'website', performanceGoal: 'OFFSITE_CONVERSIONS', icon: 'cart' },
  { id: 'video_views', objective: 'OUTCOME_ENGAGEMENT', conversionLocation: 'video', performanceGoal: 'THRUPLAY', icon: 'video' },
  { id: 'page_likes', objective: 'OUTCOME_ENGAGEMENT', conversionLocation: 'page', performanceGoal: 'PAGE_LIKES', icon: 'like' },
  { id: 'brand_awareness', objective: 'OUTCOME_AWARENESS', conversionLocation: 'default', performanceGoal: 'REACH', icon: 'eye' },
  { id: 'app_installs', objective: 'OUTCOME_APP_PROMOTION', conversionLocation: 'app', performanceGoal: 'APP_INSTALLS', icon: 'app' },
])

export function getCampaignPreset(id) {
  return CAMPAIGN_PRESETS.find((preset) => preset.id === id) || null
}
