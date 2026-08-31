export const OPEN_WHATSAPP_SIDEBAR_EVENT = 'ican:whatsapp-sidebar:open'

export function requestOpenWhatsappSidebar(detail = {}) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(OPEN_WHATSAPP_SIDEBAR_EVENT, { detail }))
}
