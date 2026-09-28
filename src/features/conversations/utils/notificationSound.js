// Channel notification sounds. Each channel gets its own player so a sound on
// one channel never suppresses another channel's sound.

const DEDUPE_WINDOW_MS = 1200
const DEDUPE_RETENTION_MS = 5000

/**
 * Create a `play(playKey)` function for one notification sound.
 * The same `playKey` is played at most once per 1.2 s (realtime events often
 * arrive twice); the Audio element is created lazily on the first play.
 */
export function createNotificationSound({ path, volume, logLabel }) {
  let audioInstance = null
  const recentlyPlayed = new Map()

  function shouldSkipPlayback(playKey) {
    if (!playKey) return false

    const now = Date.now()
    const lastPlayedAt = recentlyPlayed.get(playKey) || 0
    recentlyPlayed.set(playKey, now)

    for (const [key, timestamp] of recentlyPlayed.entries()) {
      if (now - timestamp > DEDUPE_RETENTION_MS) {
        recentlyPlayed.delete(key)
      }
    }

    return now - lastPlayedAt < DEDUPE_WINDOW_MS
  }

  return function playNotificationSound(playKey = '') {
    if (typeof window === 'undefined') return
    if (shouldSkipPlayback(String(playKey || ''))) return

    try {
      if (!audioInstance) {
        audioInstance = new Audio(path)
        audioInstance.preload = 'auto'
        audioInstance.volume = volume
      }

      audioInstance.currentTime = 0
      const playPromise = audioInstance.play()

      if (playPromise?.catch) {
        playPromise.catch((error) => {
          console.info(`[${logLabel}] Playback skipped`, {
            reason: error?.message || error,
            hint: 'Browsers can block sound until the user interacts with the page.',
          })
        })
      }
    } catch (error) {
      console.info(`[${logLabel}] Playback unavailable`, error)
    }
  }
}

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
