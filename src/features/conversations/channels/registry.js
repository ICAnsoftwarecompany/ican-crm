import { gmailAdapter } from './gmail/adapter'
import { messengerAdapter } from './messenger/adapter'
import { whatsappAdapter } from './whatsapp/adapter'

const ADAPTERS = {
  whatsapp: whatsappAdapter,
  messenger: messengerAdapter,
  gmail: gmailAdapter,
}

/** @type {import('../model/conversationModel').ChannelId[]} */
export const CONVERSATION_CHANNELS = Object.keys(ADAPTERS)

export function hasChannelAdapter(channel) {
  return Object.prototype.hasOwnProperty.call(ADAPTERS, channel)
}

export function getChannelAdapter(channel) {
  if (!hasChannelAdapter(channel)) {
    throw new Error(`Unknown conversation channel: ${channel}`)
  }
  return ADAPTERS[channel]
}
