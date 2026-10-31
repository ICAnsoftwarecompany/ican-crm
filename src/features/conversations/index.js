// Public surface of the conversations feature for other features.
// Import from here instead of reaching into conversations internals.
export { ConversationThread } from './components/shared/ConversationThread'
export { useConversationUnreadSummary } from './hooks/useConversationUnreadSummary'
// Channel side panels + logos and the adapters' normalizers, for scoped inboxes elsewhere (deal conversations, 2026-10-16).
export { WhatsappSidebarPanel } from './components/WhatsappSidebarPanel'
export { MessengerSidebarPanel } from './components/MessengerSidebarPanel'
export { GmailSidebarPanel } from './components/GmailSidebarPanel'
export { WhatsappLogoIcon } from './components/WhatsappNavbarButton'
export { MessengerLogoIcon } from './components/MessengerNavbarButton'
export { GmailLogoIcon } from './components/GmailNavbarButton'
export { getChannelAdapter, CONVERSATION_CHANNELS } from './channels/registry'
