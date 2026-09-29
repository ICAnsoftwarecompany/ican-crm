import { createNotificationSound } from '../../../shared/utils/createNotificationSound'

export { createNotificationSound }

export const MESSENGER_NOTIFICATION_SOUND_PATH = '/notifications/Messenger - QuickSounds.com.mp3'
export const WHATSAPP_NOTIFICATION_SOUND_PATH = '/notifications/whatsAppTone.mp3'

export const playMessengerNotificationSound = createNotificationSound({
  path: MESSENGER_NOTIFICATION_SOUND_PATH,
  volume: 0.55,
  logLabel: 'Messenger notification sound',
})

export const playWhatsappNotificationSound = createNotificationSound({
  path: WHATSAPP_NOTIFICATION_SOUND_PATH,
  volume: 0.6,
  logLabel: 'WhatsApp notification sound',
})
