import { BILLING_EVENT_BY_GOAL, CONVERSION_LOCATIONS, getAdSetRequirements } from '../config/metaAdSetCompatibility'
import { PLACEMENT_PLATFORMS } from '../config/metaPlacements'
import { hasRestrictedTargeting } from '../config/metaSpecialAdCategories'
import { isPositiveNumber, toMinorCurrencyUnit } from '../utils/campaignMoney'
import { getTargetedCountryCodes, toMetaGeoTargeting } from './geoTargeting'
import { toAccountIso } from './accountTime'
import { normalizePhoneNumber, withUrlParameters } from './contactFormats'
import { getEffectiveAdName, getEffectiveAdSetName, getEffectiveCampaignName } from './naming'

// Pure payload builders. Keys already accepted by the backend today are
// kept as-is (campaign_name, budget_type, countries, age_min …); the full
// Meta specs travel alongside them (targeting, promoted_object …) so the
// backend can adopt them without a frontend change. See pages/campaigns/pages/CampaignCreatePage/README_AR.md.

const BID_STRATEGY_TO_META = {
  highest_volume: 'LOWEST_COST_WITHOUT_CAP',
  highest_value: 'LOWEST_COST_WITHOUT_CAP',
  cost_cap: 'COST_CAP',
  bid_cap: 'LOWEST_COST_WITH_BID_CAP',
  minimum_roas: 'LOWEST_COST_WITH_MIN_ROAS',
}

const GENDERS_TO_META = { male: [1], female: [2] }

const KEEP_EMPTY_KEYS = new Set(['special_ad_categories'])

export function compactPayload(payload) {
  return Object.fromEntries(Object.entries(payload).filter(([key, value]) => {
    if (value === undefined || value === null || value === '') return false
    if (Array.isArray(value) && !value.length) return KEEP_EMPTY_KEYS.has(key)
    if (value && typeof value === 'object' && !Array.isArray(value) && !Object.keys(value).length) return false
    return true
  }))
}

export function getEffectiveSchedule(state, adSet) {
  if (state.campaign.budgetLevel === 'campaign' || adSet.useCampaignSchedule) return state.campaign.schedule
  return adSet.schedule
}

function budgetFields(owner, { currency, prefix = '' }) {
  if (!isPositiveNumber(owner.budgetAmount)) return {}
  const amount = toMinorCurrencyUnit(owner.budgetAmount, currency)
  const usesBidAmount = ['cost_cap', 'bid_cap'].includes(owner.bidStrategy)
  return {
    [`${prefix}daily_budget`]: owner.budgetType === 'daily' ? amount : undefined,
    [`${prefix}lifetime_budget`]: owner.budgetType === 'lifetime' ? amount : undefined,
    bid_strategy: BID_STRATEGY_TO_META[owner.bidStrategy] || BID_STRATEGY_TO_META.highest_volume,
    bid_amount: usesBidAmount && isPositiveNumber(owner.bidAmount) ? toMinorCurrencyUnit(owner.bidAmount, currency) : undefined,
    bid_constraints: owner.bidStrategy === 'minimum_roas' && isPositiveNumber(owner.roasFloor) ? { roas_average_floor: Math.round(Number(owner.roasFloor) * 10000) } : undefined,
  }
}

export function buildCampaignPayload(state, { accountId, currency, timezone, t }) {
  const campaign = state.campaign
  const hasCampaignBudget = campaign.budgetLevel === 'campaign'
  const budget = hasCampaignBudget ? budgetFields(campaign, { currency }) : {}
  const schedule = campaign.schedule
  return compactPayload({
    client_request_id: state.draftId,
    ad_account_id: accountId,
    campaign_name: getEffectiveCampaignName(state, t),
    page_id: campaign.pageId,
    objective: state.objective,
    status: campaign.publishStatus === 'ACTIVE' ? 'ACTIVE' : 'PAUSED',
    buying_type: 'AUCTION',
    special_ad_categories: campaign.specialAdCategories.length ? campaign.specialAdCategories : [],
    special_ad_category_country: campaign.specialAdCategories.length ? campaign.specialAdCategoryCountries : undefined,
    budget_level: campaign.budgetLevel,
    // Legacy keys (current backend contract)
    budget_type: hasCampaignBudget && budget.daily_budget ? 'daily' : hasCampaignBudget && budget.lifetime_budget ? 'lifetime' : undefined,
    budget_amount: budget.daily_budget ?? budget.lifetime_budget,
    ...budget,
    start_time: schedule.startType === 'scheduled' ? toAccountIso(schedule.startTime, timezone) : undefined,
    stop_time: schedule.endType === 'scheduled' ? toAccountIso(schedule.endTime, timezone) : undefined,
    spend_cap: isPositiveNumber(campaign.spendCap) ? toMinorCurrencyUnit(campaign.spendCap, currency) : undefined,
    crm_lead_routing: buildLeadRouting(state.leadRouting),
  })
}

function buildLeadRouting(routing) {
  if (!routing || (!routing.teamId && !routing.tagIds?.length && !routing.statusId && !routing.note)) return undefined
  return compactPayload({ team_id: routing.teamId, tag_ids: routing.tagIds, status_id: routing.statusId, note: routing.note })
}

export function buildTargeting(state, adSet) {
  const audience = adSet.audience
  const restricted = hasRestrictedTargeting(state.campaign.specialAdCategories)
  const interests = audience.detailedTargeting.filter((item) => item.type !== 'behaviors').map(({ id, name }) => ({ id, name: name?.en || name }))
  const behaviors = audience.detailedTargeting.filter((item) => item.type === 'behaviors').map(({ id, name }) => ({ id, name: name?.en || name }))
  const excludedInterests = (audience.detailedExclusions || []).map(({ id, name }) => ({ id, name: name?.en || name }))
  const flexible = compactPayload({ interests, behaviors })
  const targeting = {
    ...toMetaGeoTargeting(audience.geo),
    age_min: Number(audience.ageMin),
    age_max: Number(audience.ageMax),
    genders: restricted ? undefined : GENDERS_TO_META[audience.genders],
    locales: audience.languages?.length ? audience.languages.map((language) => language.id ?? language) : undefined,
    flexible_spec: Object.keys(flexible).length ? [flexible] : undefined,
    exclusions: excludedInterests.length && !restricted ? { interests: excludedInterests } : undefined,
    custom_audiences: audience.customAudienceIds?.length ? audience.customAudienceIds.map((id) => ({ id })) : undefined,
    excluded_custom_audiences: audience.excludedCustomAudienceIds?.length ? audience.excludedCustomAudienceIds.map((id) => ({ id })) : undefined,
    targeting_automation: { advantage_audience: audience.advantageAudience && !restricted ? 1 : 0 },
    ...buildPlacements(adSet),
  }
  return compactPayload(targeting)
}

function buildPlacements(adSet) {
  if (adSet.placements?.mode !== 'manual') return {}
  const selected = Object.entries(adSet.placements.manual || {}).filter(([platform, positions]) => PLACEMENT_PLATFORMS[platform] && positions?.length)
  return {
    publisher_platforms: selected.map(([platform]) => platform),
    device_platforms: adSet.placements.devices,
    ...Object.fromEntries(selected.map(([platform, positions]) => [PLACEMENT_PLATFORMS[platform].positionsKey, positions])),
  }
}

export function buildPromotedObject(state, adSet) {
  const requirements = getAdSetRequirements(state.objective, adSet)
  return compactPayload({
    page_id: state.campaign.pageId,
    pixel_id: requirements.has('pixel') ? adSet.pixelId : undefined,
    custom_event_type: requirements.has('pixel') || requirements.has('appEvent') ? adSet.customEventType : undefined,
    application_id: requirements.has('app') ? adSet.applicationId : undefined,
    object_store_url: requirements.has('app') ? adSet.objectStoreUrl : undefined,
    whatsapp_phone_number: requirements.has('whatsapp') ? normalizePhoneNumber(adSet.whatsappPhoneNumber) : undefined,
    event_id: requirements.has('event') ? adSet.eventId : undefined,
  })
}

export function buildAdSetPayload(state, adSet, { accountId, campaignRemoteId, currency, timezone, t, language }) {
  const schedule = getEffectiveSchedule(state, adSet)
  const hasAdSetBudget = state.campaign.budgetLevel === 'adSet'
  const promoted = buildPromotedObject(state, adSet)
  const targeting = buildTargeting(state, adSet)
  const requirements = getAdSetRequirements(state.objective, adSet)
  const lifetime = state.campaign.budgetLevel === 'campaign' ? state.campaign.budgetType === 'lifetime' : adSet.budgetType === 'lifetime'
  return compactPayload({
    client_request_id: `${state.draftId}:${adSet.id}`,
    ad_account_id: accountId,
    campaign_id: campaignRemoteId,
    page_id: state.campaign.pageId,
    adset_name: getEffectiveAdSetName(adSet, t, language),
    status: state.campaign.publishStatus === 'ACTIVE' ? 'ACTIVE' : 'PAUSED',
    conversion_location: adSet.conversionLocation,
    destination_type: CONVERSION_LOCATIONS[adSet.conversionLocation]?.destinationType,
    optimization_goal: adSet.performanceGoal || undefined,
    billing_event: BILLING_EVENT_BY_GOAL[adSet.performanceGoal] || 'IMPRESSIONS',
    // Legacy keys (current backend contract)
    countries: getTargetedCountryCodes(adSet.audience.geo),
    age_min: targeting.age_min,
    age_max: targeting.age_max,
    pixel_id: promoted.pixel_id,
    custom_event_type: promoted.custom_event_type,
    whatsapp_phone_number: promoted.whatsapp_phone_number,
    application_id: promoted.application_id,
    object_store_url: promoted.object_store_url,
    // Full Meta specs
    promoted_object: promoted,
    targeting,
    instagram_actor_id: requirements.has('instagram') ? adSet.instagramAccountId : undefined,
    frequency_max: requirements.has('frequencyCap') ? Number(adSet.frequencyMax) : undefined,
    frequency_interval_days: requirements.has('frequencyCap') ? Number(adSet.frequencyIntervalDays) : undefined,
    frequency_control_specs: requirements.has('frequencyCap') ? [{ event: 'IMPRESSIONS', interval_days: Number(adSet.frequencyIntervalDays), max_frequency: Number(adSet.frequencyMax) }] : undefined,
    ...(hasAdSetBudget ? budgetFields(adSet, { currency }) : {}),
    start_time: schedule.startType === 'scheduled' ? toAccountIso(schedule.startTime, timezone) : undefined,
    end_time: schedule.endType === 'scheduled' ? toAccountIso(schedule.endTime, timezone) : undefined,
    pacing_type: adSet.dayparting?.enabled && lifetime ? ['day_parting'] : undefined,
    adset_schedule: adSet.dayparting?.enabled && lifetime ? [{ start_minute: Number(adSet.dayparting.startHour) * 60, end_minute: Number(adSet.dayparting.endHour) * 60, days: adSet.dayparting.days, timezone_type: 'USER' }] : undefined,
  })
}

function buildMediaRef(media) {
  if (!media) return undefined
  return compactPayload({ type: media.type, image_hash: media.type === 'image' ? media.hash || media.id : undefined, video_id: media.type === 'video' ? media.videoId || media.id : undefined, url: media.url, name: media.name })
}

export function buildLeadFormPayload(ad, { pageId }) {
  if (ad.leadForm?.mode !== 'new') return undefined
  const draft = ad.leadForm.draft
  return compactPayload({
    page_id: pageId,
    name: draft.name,
    locale: draft.locale,
    is_optimized_for_quality: draft.formType === 'higher_intent',
    intro: compactPayload({ headline: draft.intro?.headline, description: draft.intro?.description }),
    questions: [
      ...draft.questions.map((question) => ({ type: question.type })),
      ...draft.customQuestions.map((question) => compactPayload({ type: 'CUSTOM', key: question.id, label: question.label, options: question.kind === 'choice' ? question.options.filter((option) => option.trim()).map((value, index) => ({ key: `option_${index + 1}`, value })) : undefined })),
    ],
    privacy_policy: compactPayload({ url: draft.privacyPolicyUrl, link_text: draft.privacyLinkText }),
    thank_you_page: compactPayload({
      title: draft.thankYou?.headline,
      body: draft.thankYou?.description,
      button_type: draft.thankYou?.buttonType,
      button_text: draft.thankYou?.buttonText,
      website_url: draft.thankYou?.buttonType === 'VIEW_WEBSITE' ? draft.thankYou.website : undefined,
      business_phone_number: draft.thankYou?.buttonType === 'CALL_BUSINESS' ? normalizePhoneNumber(draft.thankYou.phone) : undefined,
    }),
  })
}

export function buildAdPayload(state, adSet, ad, { accountId, adSetRemoteId, leadFormRemoteId, t }) {
  const requirements = getAdSetRequirements(state.objective, adSet)
  const link = requirements.has('websiteUrl') ? withUrlParameters(ad.websiteUrl, ad.urlParameters) : undefined
  const pageId = ad.identity?.pageId || state.campaign.pageId
  return compactPayload({
    client_request_id: `${state.draftId}:${adSet.id}:${ad.id}`,
    ad_account_id: accountId,
    adset_id: adSetRemoteId,
    name: getEffectiveAdName(ad, t),
    status: state.campaign.publishStatus === 'ACTIVE' ? 'ACTIVE' : 'PAUSED',
    creative: compactPayload({
      page_id: pageId,
      instagram_actor_id: ad.identity?.instagramAccountId || adSet.instagramAccountId || undefined,
      format: ad.format,
      existing_post_id: ad.format === 'existing_post' ? ad.existingPostId : undefined,
      primary_texts: (ad.primaryTexts || []).filter((text) => text?.trim()),
      headlines: (ad.headlines || []).filter((text) => text?.trim()),
      description: ad.description,
      media: ['single_image', 'single_video'].includes(ad.format) ? buildMediaRef(ad.media) : undefined,
      carousel_cards: ad.format === 'carousel' ? ad.carouselCards.map((card) => compactPayload({ media: buildMediaRef(card.media), headline: card.headline, description: card.description, link: card.link ? withUrlParameters(card.link, ad.urlParameters) : link })) : undefined,
      call_to_action: compactPayload({
        type: ad.callToAction,
        link,
        lead_gen_form_id: requirements.has('leadForm') ? leadFormRemoteId || ad.leadForm?.formId || undefined : undefined,
        phone_number: requirements.has('phone') ? normalizePhoneNumber(ad.phoneNumber) : undefined,
        whatsapp_number: adSet.conversionLocation === 'whatsapp' ? normalizePhoneNumber(adSet.whatsappPhoneNumber) : undefined,
      }),
      display_link: ad.displayLink,
      url_tags: ad.urlParameters || undefined,
      page_welcome_message: requirements.has('messageTemplate') && ad.messageTemplate?.greeting?.trim()
        ? compactPayload({ greeting: ad.messageTemplate.greeting, ice_breakers: ad.messageTemplate.iceBreakers.filter((question) => question.trim()) })
        : undefined,
    }),
  })
}
