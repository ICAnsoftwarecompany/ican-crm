import { createNotificationSound } from '../../../shared/utils/createNotificationSound'

export const NEW_ALERT_SOUND_PATH = '/Alerts/NewAlert.mp3'
const playSound = createNotificationSound({ path: NEW_ALERT_SOUND_PATH, volume: 0.6, logLabel: 'Operational alert sound' })

export function playAlertSound({ id, severity } = {}) {
  playSound(String(id || severity || 'alert'))
}
