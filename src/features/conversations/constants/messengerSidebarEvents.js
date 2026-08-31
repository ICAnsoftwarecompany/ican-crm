export const OPEN_MESSENGER_SIDEBAR_EVENT = 'ican:messenger-sidebar:open'

export function requestOpenMessengerSidebar(detail = {}) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(OPEN_MESSENGER_SIDEBAR_EVENT, { detail }))
}
