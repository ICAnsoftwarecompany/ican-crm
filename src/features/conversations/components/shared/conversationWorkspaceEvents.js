export const FOCUS_CONVERSATION_COMPOSER_EVENT = 'ican:focus-conversation-composer'

export function requestConversationComposerFocus() {
  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent(FOCUS_CONVERSATION_COMPOSER_EVENT))
  }, 80)
}
