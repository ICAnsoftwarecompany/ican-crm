/**
 * Meta's `actions[].action_type` / `cost_per_action_type[].action_type` values
 * contain dots (e.g. "onsite_conversion.lead"), which i18next would otherwise
 * parse as a nested-key path separator. This maps the raw, dotted action_type
 * to a flat, dot-free locale key under `campaigns.actionTypes.*`.
 *
 * Meta reports hundreds of possible action types; this covers every one seen
 * in this app's documented API contracts. Anything else falls back to a
 * humanized version of the raw string rather than a missing translation.
 */
const ACTION_TYPE_KEYS = {
  link_click: 'linkClick',
  post_reaction: 'postReaction',
  landing_page_view: 'landingPageView',
  omni_landing_page_view: 'omniLandingPageView',
  post_engagement: 'postEngagement',
  like: 'like',
  post_interaction_gross: 'postInteractionGross',
  page_engagement: 'pageEngagement',
  post_interaction_net: 'postInteractionNet',
  comment: 'comment',
  post: 'post',
  photo_view: 'photoView',
  video_view: 'videoView',
  lead: 'lead',
  onsite_web_lead: 'onsiteWebLead',
  offsite_complete_registration_add_meta_leads: 'offsiteCompleteRegistration',
  offsite_search_add_meta_leads: 'offsiteSearch',
  offsite_content_view_add_meta_leads: 'offsiteContentView',
  offsite_submit_application_add_meta_leads: 'offsiteSubmitApplication',
  offsite_contact_website_add_meta_leads: 'offsiteContactWebsite',
  'onsite_conversion.lead': 'conversionLead',
  'onsite_conversion.lead_grouped': 'conversionLeadGrouped',
  'onsite_conversion.post_save': 'postSave',
  'onsite_conversion.post_net_save': 'postNetSave',
  'onsite_conversion.post_net_like': 'postNetLike',
  'onsite_conversion.post_net_comment': 'postNetComment',
  'onsite_conversion.post_unlike': 'postUnlike',
  'onsite_conversion.total_messaging_connection': 'totalMessagingConnection',
  'onsite_conversion.messaging_conversation_started_7d': 'messagingConversationStarted',
  'onsite_conversion.messaging_conversation_replied_7d': 'messagingConversationReplied',
  'onsite_conversion.messaging_first_reply': 'messagingFirstReply',
  'onsite_conversion.messaging_welcome_message_view': 'messagingWelcomeMessageView',
  'onsite_conversion.messaging_user_depth_2_message_send': 'messagingDepth2',
  'onsite_conversion.messaging_user_depth_3_message_send': 'messagingDepth3',
  'onsite_conversion.messaging_user_depth_5_message_send': 'messagingDepth5',
}

function humanizeActionType(actionType) {
  return String(actionType || '')
    .replace(/^onsite_conversion\./, '')
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function getActionTypeLabel(actionType, t) {
  const key = ACTION_TYPE_KEYS[actionType]
  return key ? t(`campaigns.actionTypes.${key}`) : humanizeActionType(actionType)
}
