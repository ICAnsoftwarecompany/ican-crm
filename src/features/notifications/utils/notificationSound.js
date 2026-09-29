import { createNotificationSound } from '../../../shared/utils/createNotificationSound'

export const NEW_NOTIFICATION_SOUND_PATH = '/notifications/NewNotification.mp3'

export const playNewNotificationSound = createNotificationSound({
  path: NEW_NOTIFICATION_SOUND_PATH,
  volume: 0.55,
  logLabel: 'Notification center sound',
})
