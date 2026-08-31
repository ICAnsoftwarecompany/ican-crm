export const MESSENGER_NOTIFICATION_SOUND_PATH = '/notifications/Messenger - QuickSounds.com.mp3'

let audioInstance = null
const recentlyPlayed = new Map()

function shouldSkipPlayback(playKey) {
  if (!playKey) return false

  const now = Date.now()
  const lastPlayedAt = recentlyPlayed.get(playKey) || 0
  recentlyPlayed.set(playKey, now)

  for (const [key, timestamp] of recentlyPlayed.entries()) {
    if (now - timestamp > 5000) {
      recentlyPlayed.delete(key)
    }
  }

  return now - lastPlayedAt < 1200
}

export function playMessengerNotificationSound(playKey = '') {
  if (typeof window === 'undefined') return
  if (shouldSkipPlayback(String(playKey || ''))) return

  try {
    if (!audioInstance) {
      audioInstance = new Audio(MESSENGER_NOTIFICATION_SOUND_PATH)
      audioInstance.preload = 'auto'
      audioInstance.volume = 0.55
    }

    audioInstance.currentTime = 0
    const playPromise = audioInstance.play()

    if (playPromise?.catch) {
      playPromise.catch((error) => {
        console.info('[Messenger notification sound] Playback skipped', {
          reason: error?.message || error,
          hint: 'Browsers can block sound until the user interacts with the page.',
        })
      })
    }
  } catch (error) {
    console.info('[Messenger notification sound] Playback unavailable', error)
  }
}
