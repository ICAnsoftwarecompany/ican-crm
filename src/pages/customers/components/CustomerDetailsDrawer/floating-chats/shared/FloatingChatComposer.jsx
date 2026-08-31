import { useEffect, useRef, useState } from 'react'
import { FileText, Mic, Paperclip, Send, Smile, Square, X } from 'lucide-react'

const MAX_MESSAGE_LENGTH = 1000
const MAX_TEXTAREA_ROWS = 5
const EMOJIS = [
  '\u2764\uFE0F', '\u{1F602}', '\u{1F62E}', '\u{1F622}', '\u{1F621}', '\u{1F44D}', '\u{1F44E}', '\u{1F44F}',
  '\u{1F600}', '\u{1F603}', '\u{1F604}', '\u{1F60A}', '\u{1F605}', '\u{1F642}', '\u{1F643}', '\u{1F609}',
  '\u{1F60D}', '\u{1F618}', '\u{1F61A}', '\u{1F61E}', '\u{1F914}', '\u{1F64F}', '\u{1F525}', '\u2B50',
  '\u2705', '\u274C', '\u{1F389}', '\u{1F4CC}', '\u{1F4CE}', '\u{1F4AC}', '\u{1F4F7}', '\u{1F3A5}',
]

function formatRecordingTime(seconds = 0) {
  const minutes = Math.floor(seconds / 60)
  const restSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(restSeconds).padStart(2, '0')}`
}

function encodeWav(samples, sampleRate) {
  const bytesPerSample = 2
  const dataLength = samples.length * bytesPerSample
  const buffer = new ArrayBuffer(44 + dataLength)
  const view = new DataView(buffer)

  const writeString = (offset, value) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index))
    }
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + dataLength, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * bytesPerSample, true)
  view.setUint16(32, bytesPerSample, true)
  view.setUint16(34, 8 * bytesPerSample, true)
  writeString(36, 'data')
  view.setUint32(40, dataLength, true)

  let offset = 44
  for (let index = 0; index < samples.length; index += 1, offset += 2) {
    const sample = Math.max(-1, Math.min(1, samples[index]))
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
  }

  return new Blob([view], { type: 'audio/wav' })
}

function ComposerButton({ title, icon: Icon, onClick, disabled = false }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]"
    >
      <Icon size={17} />
    </button>
  )
}

export function FloatingChatComposer({
  isSending,
  onSend,
  channelColor = '#00C2CB',
  autoFocusKey,
  disabled = false,
  supportsAttachments = false,
  replyToMessage = null,
  onCancelReply,
}) {
  const [text, setText] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [error, setError] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const audioStreamRef = useRef(null)
  const audioContextRef = useRef(null)
  const audioSourceRef = useRef(null)
  const audioProcessorRef = useRef(null)
  const silentGainRef = useRef(null)
  const audioSamplesRef = useRef([])
  const audioSampleRateRef = useRef(44100)
  const recordingTimerRef = useRef(null)

  useEffect(() => {
    const element = textareaRef.current
    if (!element) return

    element.style.height = 'auto'

    const computedStyle = window.getComputedStyle(element)
    const lineHeight = Number.parseFloat(computedStyle.lineHeight) || 20
    const verticalPadding = Number.parseFloat(computedStyle.paddingTop || '0') + Number.parseFloat(computedStyle.paddingBottom || '0')
    const maxHeight = lineHeight * MAX_TEXTAREA_ROWS + verticalPadding

    element.style.height = `${Math.min(element.scrollHeight, maxHeight)}px`
    element.style.overflowY = element.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [text])

  useEffect(() => {
    if (autoFocusKey === undefined || autoFocusKey === null) return

    const timeoutId = window.setTimeout(() => {
      textareaRef.current?.focus({ preventScroll: true })
    }, 80)

    return () => window.clearTimeout(timeoutId)
  }, [autoFocusKey])

  useEffect(() => () => {
    window.clearInterval(recordingTimerRef.current)
    stopAudioRecorder()
    audioStreamRef.current?.getTracks?.().forEach((track) => track.stop())
  }, [])

  useEffect(() => () => {
    if (attachmentPreviewUrl) URL.revokeObjectURL(attachmentPreviewUrl)
  }, [attachmentPreviewUrl])

  const stopAudioTracks = () => {
    audioStreamRef.current?.getTracks?.().forEach((track) => track.stop())
    audioStreamRef.current = null
  }

  const clearRecordingTimer = () => {
    window.clearInterval(recordingTimerRef.current)
    recordingTimerRef.current = null
  }

  const stopAudioRecorder = async () => {
    audioProcessorRef.current?.disconnect?.()
    audioSourceRef.current?.disconnect?.()
    silentGainRef.current?.disconnect?.()
    audioProcessorRef.current = null
    audioSourceRef.current = null
    silentGainRef.current = null

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      await audioContextRef.current.close()
    }
    audioContextRef.current = null
  }

  const clearAttachment = () => {
    if (attachmentPreviewUrl) URL.revokeObjectURL(attachmentPreviewUrl)
    setAttachment(null)
    setAttachmentPreviewUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const setComposerAttachment = (file) => {
    if (attachmentPreviewUrl) URL.revokeObjectURL(attachmentPreviewUrl)
    setAttachment(file || null)
    setAttachmentPreviewUrl(file?.type?.startsWith('audio/') ? URL.createObjectURL(file) : '')
  }

  const stopRecording = () => {
    if (!isRecording) return

    clearRecordingTimer()
    setIsRecording(false)
    setRecordingSeconds(0)

    stopAudioRecorder()
    stopAudioTracks()

    const chunks = audioSamplesRef.current
    audioSamplesRef.current = []
    if (!chunks.length) return

    const sampleCount = chunks.reduce((total, chunk) => total + chunk.length, 0)
    const samples = new Float32Array(sampleCount)
    let offset = 0

    chunks.forEach((chunk) => {
      samples.set(chunk, offset)
      offset += chunk.length
    })

    const blob = encodeWav(samples, audioSampleRateRef.current)
    const file = new File([blob], `voice-note-${Date.now()}.wav`, { type: 'audio/wav' })
    if (import.meta.env.DEV) {
      console.info('[FloatingChatComposer] voice note ready', {
        name: file.name,
        type: file.type,
        size: file.size,
        sampleRate: audioSampleRateRef.current,
      })
    }
    setComposerAttachment(file)
  }

  const startRecording = async () => {
    if (disabled || isSending || isRecording) return

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setError('تسجيل الصوت يحتاج فتح الصفحة عبر HTTPS. استخدم رابط https://test0002.127.0.0.1.nip.io:3000')
      return
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!navigator.mediaDevices?.getUserMedia || !AudioContextClass) {
      setError('المتصفح لا يدعم تسجيل الصوت من هنا. جرّب Chrome أو Edge مع رابط HTTPS.')
      return
    }

    try {
      setError('')
      clearAttachment()

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      const audioContext = new AudioContextClass()
      const source = audioContext.createMediaStreamSource(stream)
      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      const silentGain = audioContext.createGain()

      silentGain.gain.value = 0
      audioSamplesRef.current = []
      audioSampleRateRef.current = audioContext.sampleRate
      audioStreamRef.current = stream
      audioContextRef.current = audioContext
      audioSourceRef.current = source
      audioProcessorRef.current = processor
      silentGainRef.current = silentGain

      processor.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0)
        audioSamplesRef.current.push(new Float32Array(input))
      }

      source.connect(processor)
      processor.connect(silentGain)
      silentGain.connect(audioContext.destination)

      if (false) {
        clearRecordingTimer()
        setIsRecording(false)
        setRecordingSeconds(0)
        stopAudioTracks()
        setError('تعذر تسجيل الصوت. حاول مرة أخرى.')
      }

      setIsRecording(true)
      setRecordingSeconds(0)
      clearRecordingTimer()
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((value) => value + 1)
      }, 1000)
    } catch (recordingError) {
      clearRecordingTimer()
      setIsRecording(false)
      setRecordingSeconds(0)
      stopAudioRecorder()
      stopAudioTracks()
      const permissionDenied = recordingError?.name === 'NotAllowedError' || recordingError?.name === 'SecurityError'
      setError(permissionDenied ? 'تم رفض إذن الميكروفون.' : 'تعذر فتح الميكروفون للتسجيل.')
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
      return
    }

    startRecording()
  }

  const getReplyMessageId = () => replyToMessage?.raw?.id || replyToMessage?.id || replyToMessage?.raw?.message_id || ''

  const submit = async () => {
    const value = text.trim()
    if (!value && !attachment) {
      setError('اكتب رسالة أو اختر مرفقًا أولًا.')
      return
    }

    if (value.length > MAX_MESSAGE_LENGTH) {
      setError(`الحد الأقصى ${MAX_MESSAGE_LENGTH} حرف.`)
      return
    }

    setError('')
      await onSend?.({
        text: value,
        attachment,
      replyToMessageId: getReplyMessageId(),
    })
    setText('')
    clearAttachment()
    onCancelReply?.()
    setShowEmojiPicker(false)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.overflowY = 'hidden'
    }
  }

  const sendEmoji = async (emoji) => {
    if (disabled || isSending) return

    setError('')
    await onSend?.({
      text: emoji,
      attachment: null,
      replyToMessageId: getReplyMessageId(),
    })
    onCancelReply?.()
    setShowEmojiPicker(false)
  }

  return (
    <div className="border-t border-[var(--border)] bg-[var(--surface)] p-2">
      {error && <div className="mb-2 text-xs font-semibold text-red-600">{error}</div>}

      {replyToMessage ? (
        <div className="mb-2 flex items-center gap-2 rounded-xl border border-[#D8EEF2] bg-[#F8FEFF] px-3 py-2">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-black text-[#00878D]">رد على رسالة</div>
            <div className="truncate text-xs font-semibold text-[#334155]">
              {replyToMessage.text || replyToMessage.attachments?.[0]?.type || 'مرفق'}
            </div>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#64748B] hover:bg-white hover:text-[#111827]"
            title="إلغاء الرد"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}

      {attachment ? (
        <div className="mb-2 rounded-xl border border-[#E5EEF0] bg-[#F8FAFC] px-3 py-2">
          <div className="flex items-center gap-2">
            {attachment.type?.startsWith('audio/') ? (
              <Mic size={14} className="shrink-0 text-[#0A7CFF]" />
            ) : (
              <Paperclip size={14} className="shrink-0 text-[#64748B]" />
            )}
            <div className="min-w-0 flex-1 truncate text-xs font-bold text-[#334155]">{attachment.name}</div>
            <button
              type="button"
              onClick={clearAttachment}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#64748B] hover:bg-white hover:text-[#111827]"
              title="إزالة المرفق"
            >
              <X size={14} />
            </button>
          </div>

          {attachment.type?.startsWith('audio/') && attachmentPreviewUrl ? (
            <div className="mt-2 flex items-center gap-2">
              <audio src={attachmentPreviewUrl} controls className="h-9 min-w-0 flex-1" />
              <button
                type="button"
                onClick={submit}
                disabled={disabled || isSending || isRecording}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-lg px-3 text-xs font-black text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: channelColor }}
              >
                {isSending ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                ) : (
                  <Send size={14} />
                )}
                إرسال التسجيل
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      {isRecording ? (
        <div className="mb-2 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
          <span className="min-w-0 flex-1">جاري تسجيل voice note</span>
          <span className="font-black tabular-nums">{formatRecordingTime(recordingSeconds)}</span>
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white text-red-600 hover:bg-red-100"
            title="إيقاف التسجيل"
          >
            <Square size={13} fill="currentColor" />
          </button>
        </div>
      ) : null}

      {showEmojiPicker ? (
        <div className="mb-2 flex max-h-32 flex-wrap gap-1 overflow-y-auto rounded-2xl border border-[#D8EEF2] bg-white p-2 shadow-lg">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => sendEmoji(emoji)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-lg transition-colors hover:bg-[#F1F5F9]"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex items-end gap-1">
        {supportsAttachments ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,video/*,audio/*"
              onChange={(event) => setComposerAttachment(event.target.files?.[0] || null)}
            />
            <ComposerButton
              title="صورة أو فيديو"
              icon={Paperclip}
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isSending || isRecording}
            />
            <ComposerButton
              title="Voice note"
              icon={isRecording ? Square : Mic}
              onClick={toggleRecording}
              disabled={disabled || isSending}
            />
          </>
        ) : null}
        <ComposerButton title="قالب رسالة" icon={FileText} disabled={disabled || isSending} />
        <ComposerButton
          title="Emoji"
          icon={Smile}
          onClick={() => setShowEmojiPicker((value) => !value)}
          disabled={disabled || isSending}
        />

        <textarea
          ref={textareaRef}
          value={text}
          disabled={disabled}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              submit()
            }
          }}
          placeholder="اكتب رسالة..."
          rows={1}
          maxLength={MAX_MESSAGE_LENGTH}
          className="min-h-9 flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm font-semibold text-[var(--text)] outline-none focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
        />

        <button
          type="button"
          onClick={submit}
          disabled={disabled || isSending || isRecording || (!text.trim() && !attachment)}
          aria-label="إرسال"
          className="inline-flex h-9 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]"
          style={{ backgroundColor: channelColor }}
        >
          {isSending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
          ) : (
            <Send size={17} />
          )}
        </button>
      </div>
    </div>
  )
}
