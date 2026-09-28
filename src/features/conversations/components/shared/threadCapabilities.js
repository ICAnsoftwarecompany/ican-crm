/**
 * Map a channel adapter's capabilities onto ConversationThread's feature props.
 * @param {import('../../model/conversationModel').ChannelCapabilities} capabilities
 */
export function getThreadCapabilityProps(capabilities = {}) {
  return {
    supportsAttachments: Boolean(capabilities.attachments),
    supportsReply: Boolean(capabilities.replies),
    supportsReactions: Boolean(capabilities.reactions),
  }
}
