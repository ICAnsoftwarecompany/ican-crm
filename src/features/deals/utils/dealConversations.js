/**
 * Which customer conversations (WhatsApp / Messenger / Gmail) belong to a deal (2026-10-16). Pure, tested.
 *
 * A conversation belongs to the deal when its linked lead or customer is one of the deal's leads, or its contact phone /
 * email is one of theirs. Phones compare on their last 9 digits ("+20 100 123 4567" = "01001234567"); emails ignore case.
 * Conversations come normalized by the channel adapters (`linkedLeadId`, `linkedCustomerId`, `contact.phone|email`).
 */
export const phoneKey = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits.length >= 7 ? digits.slice(-9) : ''
}
const emailKey = (value) => String(value ?? '').trim().toLowerCase()
const idKey = (value) => (value === undefined || value === null || value === '' ? '' : String(value))

/** Index of the deal's contacts from its normalized leads (`leadId`, `customerId`, `phone`, `email`). */
export function buildDealContactIndex(leads = []) {
  const index = { leadIds: new Set(), customerIds: new Set(), phones: new Set(), emails: new Set() }
  leads.forEach((lead) => {
    const leadId = idKey(lead.leadId)
    const customerId = idKey(lead.customerId)
    const phone = phoneKey(lead.phone)
    const email = emailKey(lead.email)
    if (leadId) index.leadIds.add(leadId)
    if (customerId) index.customerIds.add(customerId)
    if (phone) index.phones.add(phone)
    if (email) index.emails.add(email)
  })
  return index
}

export const isDealContactIndexEmpty = (index) => !index.leadIds.size && !index.customerIds.size && !index.phones.size && !index.emails.size

/** Does a normalized conversation belong to the deal? */
export function matchesDealContact(conversation = {}, index) {
  if (!index) return false
  const leadId = idKey(conversation.linkedLeadId)
  const customerId = idKey(conversation.linkedCustomerId)
  const phone = phoneKey(conversation.contact?.phone)
  const email = emailKey(conversation.contact?.email)
  return Boolean(
    (leadId && index.leadIds.has(leadId))
    || (customerId && index.customerIds.has(customerId))
    || (phone && index.phones.has(phone))
    || (email && index.emails.has(email)),
  )
}

/** Filter for a channel's raw conversations: `normalize` is that channel adapter's normalizeConversation. */
export function makeDealConversationFilter(index, normalize) {
  return (raw) => {
    try {
      return matchesDealContact(normalize(raw), index)
    } catch {
      return false
    }
  }
}
