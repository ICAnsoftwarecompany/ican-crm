// Manual placements — mirrors Ads Manager's "Manual placements" panel.
export const PLACEMENT_PLATFORMS = Object.freeze({
  facebook: {
    positionsKey: 'facebook_positions',
    positions: ['feed', 'profile_feed', 'marketplace', 'video_feeds', 'right_hand_column', 'story', 'facebook_reels', 'instream_video', 'search'],
  },
  instagram: {
    positionsKey: 'instagram_positions',
    positions: ['stream', 'profile_feed', 'explore', 'explore_home', 'story', 'reels', 'ig_search'],
  },
  messenger: {
    positionsKey: 'messenger_positions',
    positions: ['messenger_home', 'story'],
  },
  audience_network: {
    positionsKey: 'audience_network_positions',
    positions: ['classic', 'rewarded_video'],
  },
})

export const DEVICE_PLATFORMS = Object.freeze(['mobile', 'desktop'])

// Destinations that can't run on some platforms. Selecting them manually
// is flagged by the validator.
const UNSUPPORTED_PLATFORMS_BY_LOCATION = Object.freeze({
  instant_form: ['audience_network'],
  messenger: ['audience_network'],
  whatsapp: ['audience_network', 'messenger'],
  instagram_direct: ['audience_network', 'messenger'],
  messaging_apps: ['audience_network'],
  instagram_profile: ['facebook', 'messenger', 'audience_network'],
  page: ['instagram', 'messenger', 'audience_network'],
  event: ['instagram', 'messenger', 'audience_network'],
  phone_call: ['messenger', 'audience_network'],
})

export function getUnsupportedPlatforms(location) {
  return UNSUPPORTED_PLATFORMS_BY_LOCATION[location] || []
}

export function createDefaultManualPlacements(location) {
  const unsupported = getUnsupportedPlatforms(location)
  return Object.fromEntries(
    Object.entries(PLACEMENT_PLATFORMS)
      .filter(([platform]) => !unsupported.includes(platform))
      .map(([platform, config]) => [platform, [...config.positions]])
  )
}
