import { getCustomerName } from '../../../pages/customers/components/bulk-actions/social-messaging/customerSocialMessagingUtils'

/**
 * Audience eligibility checks for the Campaign Wizard's Audience step.
 *
 * IMPORTANT limitation (see docs "Backend Gaps"): this only evaluates
 * customers already loaded into the browser (whatever the Customers
 * DataTable/infinite query currently has in memory). There is no backend
 * endpoint today to resolve "how many of the 5,000 customers matching this
 * filter are WhatsApp-eligible" without loading them all — that is a
 * documented required backend evolution (a count/preview endpoint), not
 * something this function fakes.
 *
 * For Messenger, the backend's `external_id` field has no confirmed link to
 * a customer record (see config/campaignChannels.js), so eligibility is
 * reported as `unknown` for every customer rather than guessed.
 */

function getCustomerPhone(customer) {
  return customer?.lead?.phone || customer?.phone || ''
}

function getCustomerEmail(customer) {
  return customer?.lead?.email || customer?.email || ''
}

/**
 * @param {Array<object>} customers
 * @param {string} channelKey
 * @returns {{ eligible: object[], ineligible: object[], unknown: object[], duplicateIds: Set<any> }}
 */
export function evaluateAudienceEligibility(customers = [], channelKey) {
  const eligible = []
  const ineligible = []
  const unknown = []
  const seenIds = new Set()
  const duplicateIds = new Set()

  customers.forEach((customer) => {
    const id = customer?.id
    if (id !== undefined && id !== null) {
      if (seenIds.has(id)) duplicateIds.add(id)
      seenIds.add(id)
    }

    if (channelKey === 'whatsapp') {
      return getCustomerPhone(customer) ? eligible.push(customer) : ineligible.push(customer)
    }

    if (channelKey === 'gmail') {
      return getCustomerEmail(customer) ? eligible.push(customer) : ineligible.push(customer)
    }

    // messenger, or any unregistered channel: eligibility cannot be computed today
    unknown.push(customer)
  })

  return { eligible, ineligible, unknown, duplicateIds }
}

export function getAudienceMissingFieldLabel(channelKey) {
  if (channelKey === 'whatsapp') return 'outreachCampaigns.audience.missingPhone'
  if (channelKey === 'gmail') return 'outreachCampaigns.audience.missingEmail'
  return 'outreachCampaigns.audience.eligibilityUnknown'
}

export { getCustomerName, getCustomerPhone, getCustomerEmail }
