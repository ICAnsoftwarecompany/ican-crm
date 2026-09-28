/**
 * Normalized conversations model shared by every channel adapter
 * (see channels/<channel>/adapter.js and docs/CONVERSATIONS_UNIFICATION_PLAN.md).
 * Typedefs only; there is no runtime code in this module.
 */

/** @typedef {'whatsapp'|'messenger'|'gmail'} ChannelId */

/**
 * @typedef {Object} Contact
 * @property {string} id
 * @property {string} name
 * @property {string} phone
 * @property {string} email
 * @property {string} avatarUrl
 * @property {Object|null} raw  Untouched contact object from the API (or null).
 */

/**
 * @typedef {Object} Attachment
 * Every original attachment field is kept (the channel normalizers spread the source object).
 * @property {'image'|'video'|'audio'|'file'|string} type
 * @property {string} url
 * @property {string} originalUrl
 * @property {string} mimeType
 * @property {string} label
 * @property {number} size
 */

/**
 * @typedef {Object} Message
 * @property {ChannelId} channel
 * @property {string} id
 * @property {string} conversationId
 * @property {'incoming'|'outgoing'|string} direction  Channel output kept as-is (Messenger passes unknown values through).
 * @property {string} status
 * @property {string} text
 * @property {string} createdAt
 * @property {Attachment[]} attachments
 * @property {Array} reactions
 * @property {string} [replyToMessageId]
 * @property {Object|null} [replyTo]
 * @property {string} [subject]  Gmail only.
 * @property {Object} raw     Legacy normalizer `raw` (may be enriched, e.g. WhatsApp swaps `raw.id`); UI reads it.
 * @property {Object} source  Untouched API message object.
 */

/**
 * @typedef {Object} Conversation
 * @property {ChannelId} channel
 * @property {string} id
 * @property {Contact} contact
 * @property {string} title
 * @property {string} subtitle
 * @property {Message|null} lastMessage
 * @property {number} unreadCount
 * @property {string} updatedAt
 * @property {'open'|'closed'|string} status
 * @property {string} linkedCustomerId
 * @property {string} linkedLeadId
 * @property {{ id: string, name: string }|null} assignedUser
 * @property {Object} raw  Untouched API conversation object.
 */

/**
 * @typedef {Object} RealtimeEvent
 * Raw payload pieces; consumers merge them into their caches and normalize afterwards.
 * @property {ChannelId} channel
 * @property {string} eventName
 * @property {string} conversationId
 * @property {Object|null} message
 * @property {Object|null} conversation
 */

/**
 * @typedef {Object} ChannelCapabilities
 * Describes what the current UI supports per channel. Nothing enforces these flags yet.
 * @property {boolean} attachments
 * @property {boolean} reactions
 * @property {boolean} removeReactions
 * @property {boolean} replies
 * @property {boolean} templates
 * @property {boolean} emailSubject
 * @property {boolean} mailboxes
 * @property {boolean} linkCustomer
 * @property {boolean} closeReopen
 * @property {boolean} assign
 * @property {number|null} messagingWindowHours  Meta policy note only; not enforced in the UI.
 */

export {}
