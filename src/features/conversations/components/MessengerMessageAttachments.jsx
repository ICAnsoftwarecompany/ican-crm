import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FileText, Gauge, Image as ImageIcon, MoreVertical, Pause, Play, Volume2 } from 'lucide-react'

const VOICE_NOTE_SPEEDS = [0.75, 1, 1.25, 1.5, 2, 3]

function formatFileSize(size) {
  const value = Number(size || 0)
  if (!value) return ''
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

function AttachmentFrame({ children }) {
  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-white/30 bg-black/5">
      {children}
    </div>
  )
}

function formatAudioTime(value) {
  const seconds = Math.max(0, Math.floor(Number(value || 0)))
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = String(seconds % 60).padStart(2, '0')
  return `${minutes}:${remainingSeconds}`
}

function getFloatingMenuRect(anchor, menuWidth = 112, menuHeight = 188) {
  if (!anchor) return null
  const rect = anchor.getBoundingClientRect()
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight
  const left = Math.max(8, Math.min(rect.left + rect.width / 2 - menuWidth / 2, viewportWidth - menuWidth - 8))
  const topAbove = rect.top - menuHeight - 8
  const topBelow = rect.bottom + 8
  const top = topAbove >= 8 ? topAbove : Math.min(topBelow, viewportHeight - menuHeight - 8)
  return { left, top: Math.max(8, top), width: menuWidth }
}

function MessengerVoiceNoteAttachment({ attachment, outgoing = false }) {
  const audioRef = useRef(null)
  const speedButtonRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [speedMenuRect, setSpeedMenuRect] = useState(null)
  const url = attachment?.url || ''
  const sizeLabel = formatFileSize(attachment?.size)

  const progress = useMemo(() => {
    if (!duration) return 0
    return Math.min(100, Math.max(0, (currentTime / duration) * 100))
  }, [currentTime, duration])

  useEffect(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setShowSpeedMenu(false)
  }, [url])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  useEffect(() => {
    if (!showSpeedMenu) {
      setSpeedMenuRect(null)
      return undefined
    }

    const updatePosition = () => {
      setSpeedMenuRect(getFloatingMenuRect(speedButtonRef.current))
    }

    const handlePointerDown = (event) => {
      if (speedButtonRef.current?.contains(event.target)) return
      setShowSpeedMenu(false)
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [showSpeedMenu])

  const togglePlayback = async () => {
    const audio = audioRef.current
    if (!audio || !url) return

    if (audio.paused) {
      await audio.play()
      setIsPlaying(true)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  const updateProgress = (event) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const nextProgress = Number(event.target.value || 0)
    audio.currentTime = (nextProgress / 100) * duration
    setCurrentTime(audio.currentTime)
  }

  return (
    <div
      dir="ltr"
      className={[
        'mt-2 flex min-w-[250px] max-w-full items-center gap-2 rounded-full border px-2 py-2 text-left shadow-sm',
        outgoing
          ? 'border-[#B8D8FF] bg-[#E8F2FF] text-[#0A4EA3]'
          : 'border-[#D8DEE7] bg-[#F1F5F9] text-[#1F2937]',
      ].join(' ')}
    >
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onLoadedMetadata={(event) => {
          event.currentTarget.playbackRate = playbackRate
          setDuration(event.currentTarget.duration || 0)
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime || 0)}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      <button
        type="button"
        onClick={togglePlayback}
        className={[
          'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition',
          outgoing ? 'bg-[#0A7CFF] text-white hover:bg-[#0869D8]' : 'bg-white text-[#111827] hover:bg-[#E2E8F0]',
        ].join(' ')}
        title={isPlaying ? '\u0625\u064a\u0642\u0627\u0641' : '\u062a\u0634\u063a\u064a\u0644'}
      >
        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
      </button>
      <span className="shrink-0 text-[11px] font-black tabular-nums">
        {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
      </span>
      <input
        type="range"
        min="0"
        max="100"
        value={progress}
        onChange={updateProgress}
        className="h-1 min-w-16 flex-1 cursor-pointer appearance-none rounded-full bg-transparent accent-current"
        style={{
          background: `linear-gradient(to right, currentColor ${progress}%, rgba(15, 23, 42, 0.22) ${progress}%)`,
        }}
        aria-label="\u062a\u0642\u062f\u0645 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u0635\u0648\u062a\u064a\u0629"
      />
      <Volume2 size={17} className="shrink-0 opacity-85" />
      <span className="shrink-0">
        <button
          ref={speedButtonRef}
          type="button"
          onClick={() => setShowSpeedMenu((current) => !current)}
          className={[
            'inline-flex h-8 min-w-9 items-center justify-center gap-1 rounded-full px-2 text-[10px] font-black transition',
            outgoing ? 'bg-white/80 text-[#0A4EA3] hover:bg-white' : 'bg-white text-[#1F2937] hover:bg-[#E2E8F0]',
          ].join(' ')}
          title="\u062a\u0633\u0631\u064a\u0639 \u0623\u0648 \u0625\u0628\u0637\u0627\u0621 \u0627\u0644\u0635\u0648\u062a"
        >
          <Gauge size={14} />
          <span>{playbackRate}x</span>
        </button>
        {showSpeedMenu && speedMenuRect && typeof document !== 'undefined'
          ? createPortal(
              <div
                dir="ltr"
                className="fixed z-[10000] flex flex-col rounded-xl border border-[#D8E7EA] bg-white p-1 text-left shadow-2xl"
                style={{
                  left: speedMenuRect.left,
                  top: speedMenuRect.top,
                  width: speedMenuRect.width,
                }}
              >
                {VOICE_NOTE_SPEEDS.map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => {
                      setPlaybackRate(speed)
                      setShowSpeedMenu(false)
                    }}
                    className={[
                      'rounded-lg px-2 py-1.5 text-start text-[11px] font-black transition hover:bg-[#E8F9FA]',
                      playbackRate === speed ? 'text-[#007A80]' : 'text-[#334155]',
                    ].join(' ')}
                  >
                    {speed}x
                  </button>
                ))}
              </div>,
              document.body
            )
          : null}
      </span>
      <button
        type="button"
        className="inline-flex h-8 w-7 shrink-0 items-center justify-center rounded-full opacity-80 transition hover:bg-black/5 hover:opacity-100"
        title={sizeLabel || 'Voice note'}
      >
        <MoreVertical size={16} />
      </button>
    </div>
  )
}

export function MessengerMessageAttachments({ attachments = [], outgoing = false, onOpenMedia }) {
  if (!attachments.length) return null

  return (
    <div className="space-y-2">
      {attachments.map((attachment, index) => {
        const type = String(attachment?.type || '').toLowerCase()
        const url = attachment?.url || ''
        const label = attachment?.mimeType || attachment?.mime_type || type || 'file'
        const sizeLabel = formatFileSize(attachment?.size)
        const key = attachment?.key || attachment?.id || `${url}-${index}`

        if (type === 'image') {
          return (
            <AttachmentFrame key={key}>
              <button
                type="button"
                onClick={() => onOpenMedia?.(attachment)}
                className="block w-full overflow-hidden text-start"
                title="فتح الصورة"
              >
                <img
                  src={url}
                  alt="Messenger attachment"
                  className="max-h-64 w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            </AttachmentFrame>
          )
        }

        if (type === 'video') {
          return (
            <AttachmentFrame key={key}>
              <button
                type="button"
                onClick={() => onOpenMedia?.(attachment)}
                className="relative block w-full overflow-hidden bg-black text-start"
                title="فتح الفيديو"
              >
                <video src={url} className="max-h-64 w-full bg-black" muted />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[#0F172A] shadow-lg">
                    <Play size={20} />
                  </span>
                </span>
              </button>
            </AttachmentFrame>
          )
        }

        if (type === 'audio') {
          return <MessengerVoiceNoteAttachment key={key} attachment={attachment} outgoing={outgoing} />
        }

        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noreferrer"
            className={`mt-2 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${
              outgoing
                ? 'border-white/30 bg-white/15 text-white'
                : 'border-[#D8EEF2] bg-[#F8FEFF] text-[#334155]'
            }`}
          >
            {type === 'image' ? <ImageIcon size={15} /> : type === 'video' ? <Play size={15} /> : <FileText size={15} />}
            <span className="min-w-0 flex-1 truncate">{label}</span>
            {sizeLabel ? <span className="shrink-0 opacity-75">{sizeLabel}</span> : null}
          </a>
        )
      })}
    </div>
  )
}
