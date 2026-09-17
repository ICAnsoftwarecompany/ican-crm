/**
 * Campaign "purpose"/objective options shown in Step 1 (Campaign Setup).
 *
 * IMPORTANT: this is a local, frontend-only classification. The current
 * `/api/tenant/campaigns/create` payload has no `objective` field, so this
 * value is captured for the user's own organization/reporting purposes only
 * and is deliberately NEVER sent to the backend — see
 * `buildCampaignPayload` in `utils/buildCampaignPayload.js`, which reads the
 * wizard form state but never forwards `objective`.
 *
 * Documented as a future backend extension in
 * OUTREACH_CAMPAIGNS_ARCHITECTURE_AR.md ("Backend Gaps / Required Evolution").
 */
export const CAMPAIGN_OBJECTIVES = [
  { value: 'retargeting', labelKey: 'outreachCampaigns.objectives.retargeting' },
  { value: 'follow_up', labelKey: 'outreachCampaigns.objectives.followUp' },
  { value: 'promotion', labelKey: 'outreachCampaigns.objectives.promotion' },
  { value: 'reactivation', labelKey: 'outreachCampaigns.objectives.reactivation' },
  { value: 'upsell', labelKey: 'outreachCampaigns.objectives.upsell' },
  { value: 'cross_sell', labelKey: 'outreachCampaigns.objectives.crossSell' },
  { value: 'qualification', labelKey: 'outreachCampaigns.objectives.qualification' },
  { value: 'announcement', labelKey: 'outreachCampaigns.objectives.announcement' },
  { value: 'custom', labelKey: 'outreachCampaigns.objectives.custom' },
]
