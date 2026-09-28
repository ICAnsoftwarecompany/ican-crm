// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createNotificationSound } from './notificationSound'

class FakeAudio {
  static instances = []

  constructor(src) {
    this.src = src
    this.play = vi.fn(() => Promise.resolve())
    FakeAudio.instances.push(this)
  }
}

describe('createNotificationSound', () => {
  beforeEach(() => {
    FakeAudio.instances = []
    vi.stubGlobal('Audio', FakeAudio)
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-28T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('creates one lazily configured Audio per sound and reuses it', () => {
    const play = createNotificationSound({ path: '/a.mp3', volume: 0.55, logLabel: 'A' })
    expect(FakeAudio.instances).toHaveLength(0)

    play('m_1')
    vi.advanceTimersByTime(2000)
    play('m_2')

    expect(FakeAudio.instances).toHaveLength(1)
    expect(FakeAudio.instances[0]).toMatchObject({ src: '/a.mp3', volume: 0.55, preload: 'auto', currentTime: 0 })
    expect(FakeAudio.instances[0].play).toHaveBeenCalledTimes(2)
  })

  it('skips the same key within 1.2 s but plays it again afterwards', () => {
    const play = createNotificationSound({ path: '/a.mp3', volume: 0.5, logLabel: 'A' })

    play('m_1')
    vi.advanceTimersByTime(500)
    play('m_1')
    vi.advanceTimersByTime(1300)
    play('m_1')

    expect(FakeAudio.instances[0].play).toHaveBeenCalledTimes(2)
  })

  it('never dedupes an empty key', () => {
    const play = createNotificationSound({ path: '/a.mp3', volume: 0.5, logLabel: 'A' })
    play()
    play('')
    expect(FakeAudio.instances[0].play).toHaveBeenCalledTimes(2)
  })

  it('keeps channels independent: the same key plays on both', () => {
    const playMessenger = createNotificationSound({ path: '/messenger.mp3', volume: 0.55, logLabel: 'Messenger' })
    const playWhatsapp = createNotificationSound({ path: '/whatsapp.mp3', volume: 0.6, logLabel: 'WhatsApp' })

    playMessenger('shared-key')
    playWhatsapp('shared-key')

    expect(FakeAudio.instances.map((audio) => audio.src)).toEqual(['/messenger.mp3', '/whatsapp.mp3'])
    expect(FakeAudio.instances.every((audio) => audio.play.mock.calls.length === 1)).toBe(true)
  })

  it('logs instead of throwing when playback is blocked', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {})
    const play = createNotificationSound({ path: '/a.mp3', volume: 0.5, logLabel: 'Blocked' })
    play('m_1')
    FakeAudio.instances[0].play.mockReturnValueOnce(Promise.reject(new Error('NotAllowedError')))
    vi.advanceTimersByTime(2000)
    play('m_1')
    await vi.runAllTimersAsync()

    expect(info).toHaveBeenCalledWith('[Blocked] Playback skipped', expect.objectContaining({ reason: 'NotAllowedError' }))
    info.mockRestore()
  })
})
