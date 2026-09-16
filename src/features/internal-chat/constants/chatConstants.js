export const CHAT_ROUTE = '/team-chat'

export const chatKeys = {
  all: ['internal-chat'],
  conversations: (params = {}) => [...chatKeys.all, 'conversations', params],
  conversation: (conversationId) => [...chatKeys.all, 'conversation', String(conversationId || '')],
  messages: (conversationId, params = {}) => [...chatKeys.all, 'messages', String(conversationId || ''), params],
  members: (conversationId) => [...chatKeys.all, 'members', String(conversationId || '')],
  unread: () => [...chatKeys.all, 'unread'],
}

export const INTERNAL_CHAT_NOTIFICATION_CHANNEL = 'internal-chat'

export const INTERNAL_CHAT_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '✅', '👀']

export const INTERNAL_CHAT_MUTE_PRESETS = [
  { key: '1h', label: 'Mute 1 hour', hours: 1 },
  { key: '8h', label: 'Mute 8 hours', hours: 8 },
  { key: 'tomorrow', label: 'Mute until tomorrow', hours: 24 },
  { key: '1w', label: 'Mute 1 week', hours: 24 * 7 },
  { key: 'forever', label: 'Mute forever', hours: null },
]
