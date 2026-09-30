// Call-to-action buttons Meta allows per destination. First entry is the
// default the wizard pre-selects.
const CTA_BY_LOCATION = Object.freeze({
  website: ['LEARN_MORE', 'SHOP_NOW', 'SIGN_UP', 'BOOK_TRAVEL', 'CONTACT_US', 'GET_OFFER', 'GET_QUOTE', 'SUBSCRIBE', 'APPLY_NOW', 'ORDER_NOW', 'DOWNLOAD', 'WATCH_MORE'],
  website_and_app: ['SHOP_NOW', 'LEARN_MORE', 'ORDER_NOW', 'SIGN_UP'],
  instant_form: ['SIGN_UP', 'LEARN_MORE', 'APPLY_NOW', 'GET_QUOTE', 'BOOK_TRAVEL', 'SUBSCRIBE', 'GET_OFFER', 'DOWNLOAD'],
  messenger: ['MESSAGE_PAGE'],
  whatsapp: ['WHATSAPP_MESSAGE'],
  instagram_direct: ['INSTAGRAM_MESSAGE'],
  messaging_apps: ['MESSAGE_PAGE'],
  instagram_profile: ['VIEW_INSTAGRAM_PROFILE'],
  phone_call: ['CALL_NOW'],
  app: ['INSTALL_MOBILE_APP', 'USE_APP', 'PLAY_GAME', 'SHOP_NOW', 'SIGN_UP'],
  page: ['LIKE_PAGE'],
  event: ['EVENT_RSVP'],
  post: ['NO_BUTTON', 'LEARN_MORE', 'MESSAGE_PAGE'],
  video: ['NO_BUTTON', 'LEARN_MORE', 'WATCH_MORE'],
  default: ['NO_BUTTON', 'LEARN_MORE', 'CONTACT_US', 'SHOP_NOW'],
})

export function getCallToActions(location) {
  return CTA_BY_LOCATION[location] || CTA_BY_LOCATION.default
}

// Meta's recommended text lengths — longer text is allowed but truncated
// in most placements, so the wizard warns instead of blocking.
export const AD_TEXT_LIMITS = Object.freeze({
  primaryText: 125,
  headline: 40,
  description: 30,
  maxPrimaryTextVariants: 5,
  maxHeadlineVariants: 5,
})

export const AD_FORMATS = Object.freeze(['single_image', 'single_video', 'carousel', 'existing_post'])
export const CAROUSEL_LIMITS = Object.freeze({ min: 2, max: 10 })
