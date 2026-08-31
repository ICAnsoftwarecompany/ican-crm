import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AlertCircle,
  ArrowDown,
  Check,
  CheckCheck,
  Clock3,
  RefreshCw,
  Reply,
  SmilePlus,
} from 'lucide-react'
import { MessengerMediaGalleryDialog } from '../../../../../../features/conversations/components/MessengerMediaGalleryDialog'
import { MessengerMessageAttachments } from '../../../../../../features/conversations/components/MessengerMessageAttachments'

const QUICK_REACTIONS = ['❤️', '👍', '😂', '😮', '😢']

function toDisplayText(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object') {
    return (
      toDisplayText(value.body) ||
      toDisplayText(value.text) ||
      toDisplayText(value.message) ||
      toDisplayText(value.title) ||
      ''
    )
  }
  return String(value)
}

function formatDateTime12PreserveSource(value) {
  if (!value) return ''

  const isoMatch = String(value).match(/^(\d{4}-\d{2}-\d{2})[T\s](\d{2}):(\d{2})/)
  if (isoMatch) {
    const datePart = isoMatch[1]
    const hour24 = Number.parseInt(isoMatch[2], 10)
    const minute = isoMatch[3]

    if (!Number.isNaN(hour24)) {
      const period = hour24 >= 12 ? 'PM' : 'AM'
      const hour12 = hour24 % 12 || 12
      return `${datePart} ${hour12}:${minute} ${period}`
    }
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function isOutgoingMessage(message = {}) {
  const direction = String(message?.direction || '').toLowerCase()
  const status = String(message?.status || '').toLowerCase()
  return direction === 'outgoing' || direction === 'outbound' || status === 'sent' || status === 'read'
}

function getSenderName(message = {}) {
  return (
    message?.raw?.sent_by?.name ||
    message?.raw?.sent_by_user?.name ||
    message?.raw?.sender?.name ||
    ''
  )
}

function MessageStatus({ status }) {
  const normalizedStatus = String(status || '').toLowerCase()
  if (normalizedStatus === 'sending') return <Clock3 size={12} />
  if (normalizedStatus === 'read') return <CheckCheck size={12} className="text-[#0A7CFF]" />
  if (normalizedStatus === 'delivered') return <CheckCheck size={12} />
  if (normalizedStatus === 'failed') return <AlertCircle size={12} className="text-red-500" />
  return <Check size={12} />
}

function getStatusLabel(status = '') {
  const normalizedStatus = String(status || '').toLowerCase()
  if (normalizedStatus === 'failed') return 'فشل الإرسال'
  if (normalizedStatus === 'sending') return 'جاري الإرسال'
  return ''
}

function getReplyLabel(message = {}) {
  return (
    toDisplayText(message?.replyTo?.body) ||
    toDisplayText(message?.replyTo?.text) ||
    toDisplayText(message?.replyTo) ||
    toDisplayText(message?.raw?.reply_to?.body) ||
    toDisplayText(message?.raw?.reply_to?.text) ||
    toDisplayText(message?.raw?.reply_to) ||
    ''
  )
}

function getMessageBackendId(message = {}) {
  return message?.raw?.id || message?.id || message?.raw?.message_id || ''
}

function getMessageLookupIds(message = {}) {
  return [
    message?.id,
    message?.raw?.id,
    message?.raw?.message_id,
    message?.message_id,
  ].filter((value) => value !== undefined && value !== null && value !== '').map((value) => String(value))
}

function getReplyTargetId(message = {}) {
  return (
    message?.replyToMessageId ||
    message?.raw?.reply_to_message_id ||
    message?.replyTo?.id ||
    message?.raw?.reply_to?.id ||
    ''
  )
}

function getMessagePartyIds(message = {}) {
  const raw = message?.raw || {}
  const outgoing = isOutgoingMessage(message)
  return {
    crmId: String(outgoing ? raw.from_id || '' : raw.to_id || ''),
    customerId: String(outgoing ? raw.to_id || '' : raw.from_id || ''),
  }
}

function getReactionOrigin(reaction = {}, message = {}) {
  const reactorId = String(reaction?.reactor_id || reaction?.reactorId || reaction?.user_id || '')
  if (!reactorId) return 'unknown'

  const { crmId, customerId } = getMessagePartyIds(message)
  if (customerId && reactorId === customerId) return 'customer'
  if (crmId && reactorId === crmId) return 'crm'
  return 'unknown'
}

function getReactionClassName(origin = 'unknown') {
  if (origin === 'customer') {
    return 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8] shadow-[0_4px_14px_rgba(37,99,235,0.12)]'
  }

  if (origin === 'crm') {
    return 'border-[#99F6E4] bg-[#ECFDF5] text-[#047857] shadow-[0_4px_14px_rgba(5,150,105,0.12)]'
  }

  return 'border-[#E2E8F0] bg-white text-[#0F172A] shadow-sm'
}

function getReactionActorName(reaction = {}, message = {}, origin = 'unknown') {
  const raw = message?.raw || {}
  return (
    reaction?.user?.name ||
    reaction?.reactor?.name ||
    reaction?.actor?.name ||
    reaction?.created_by?.name ||
    reaction?.createdBy?.name ||
    reaction?.sent_by?.name ||
    reaction?.user_name ||
    reaction?.reactor_name ||
    reaction?.actor_name ||
    reaction?.name ||
    (origin === 'customer'
      ? '\u0627\u0644\u0639\u0645\u064a\u0644'
      : origin === 'crm'
        ? raw?.sent_by?.name || raw?.sent_by_user?.name || raw?.user?.name || '\u0645\u0633\u062a\u062e\u062f\u0645 CRM'
        : '\u063a\u064a\u0631 \u0645\u0639\u0631\u0648\u0641')
  )
}

function getReactionTitle(origin = 'unknown', actorName = '') {
  if (origin === 'customer') return `\u062a\u0641\u0627\u0639\u0644 \u0645\u0646 ${actorName || '\u0627\u0644\u0639\u0645\u064a\u0644'}`
  if (origin === 'crm') return `\u062a\u0641\u0627\u0639\u0644 \u0645\u0646 ${actorName || '\u0645\u0633\u062a\u062e\u062f\u0645 CRM'}`
  return actorName ? `\u062a\u0641\u0627\u0639\u0644 \u0645\u0646 ${actorName}` : '\u0645\u0635\u062f\u0631 \u0627\u0644\u062a\u0641\u0627\u0639\u0644 \u063a\u064a\u0631 \u0645\u0639\u0631\u0648\u0641'
}

function getReactionTooltipRect(anchor, tooltipWidth = 180, tooltipHeight = 42) {
  if (!anchor) return null
  const rect = anchor.getBoundingClientRect()
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight
  const left = Math.max(8, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, viewportWidth - tooltipWidth - 8))
  const topAbove = rect.top - tooltipHeight - 8
  const topBelow = rect.bottom + 8
  const top = topAbove >= 8 ? topAbove : Math.min(topBelow, viewportHeight - tooltipHeight - 8)
  return { left, top: Math.max(8, top), width: tooltipWidth }
}

function MessageReactionBadge({
  reaction,
  reactionText,
  reactionOrigin,
  reactionActorName,
  onRemoveReaction,
  messageBackendId,
}) {
  const badgeRef = useRef(null)
  const [tooltipRect, setTooltipRect] = useState(null)
  const tooltipText = getReactionTitle(reactionOrigin, reactionActorName)

  const showTooltip = () => {
    setTooltipRect(getReactionTooltipRect(badgeRef.current))
  }

  const hideTooltip = () => {
    setTooltipRect(null)
  }

  useEffect(() => {
    if (!tooltipRect) return undefined

    const syncTooltip = () => {
      setTooltipRect(getReactionTooltipRect(badgeRef.current))
    }

    window.addEventListener('scroll', syncTooltip, true)
    window.addEventListener('resize', syncTooltip)

    return () => {
      window.removeEventListener('scroll', syncTooltip, true)
      window.removeEventListener('resize', syncTooltip)
    }
  }, [tooltipRect])

  return (
    <span
      ref={badgeRef}
      key={`${reaction?.reactor_id || reaction?.reactorId || reaction?.user_id || reactionText}-${reactionText}`}
      role={onRemoveReaction ? 'button' : undefined}
      tabIndex={onRemoveReaction ? 0 : undefined}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      onDoubleClick={() => onRemoveReaction?.({ messageId: messageBackendId, reaction: reactionText })}
      onKeyDown={(event) => {
        if (!onRemoveReaction) return
        if (event.key === 'Delete' || event.key === 'Backspace') {
          event.preventDefault()
          onRemoveReaction({ messageId: messageBackendId, reaction: reactionText })
        }
      }}
      className={`relative inline-flex cursor-help items-center rounded-full border px-1.5 py-0.5 text-xs font-black ${getReactionClassName(reactionOrigin)}`}
      aria-label={tooltipText}
    >
      {reactionText}
      {tooltipRect && typeof document !== 'undefined'
        ? createPortal(
            <div
              dir="auto"
              className="pointer-events-none fixed z-[10000] rounded-lg border border-[#D8E7EA] bg-white px-2 py-1 text-center text-[10px] font-black text-[#0F172A] shadow-2xl"
              style={{
                left: tooltipRect.left,
                top: tooltipRect.top,
                width: tooltipRect.width,
              }}
            >
              {tooltipText}
            </div>,
            document.body
          )
        : null}
    </span>
  )
}

export function FloatingChatMessages({
  messages = [],
  isLoadingMessages,
  error,
  hasMoreMessages,
  onLoadMore,
  channelColor = '#00C2CB',
  highlightedMessageId = '',
  autoScrollKey,
  emptyMessage = 'لا توجد رسائل بعد.',
  emptyDescription = 'النافذة جاهزة للربط مع API الإرسال والاستقبال.',
  supportsReply = false,
  supportsReactions = false,
  onReply,
  onReact,
  onRemoveReaction,
}) {
  const scrollRef = useRef(null)
  const wasNearBottomRef = useRef(true)
  const lastOutgoingMessageIdRef = useRef('')
  const messageRefsRef = useRef(new Map())
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [reactionPickerId, setReactionPickerId] = useState('')
  const [activeMediaIndex, setActiveMediaIndex] = useState(-1)
  const [jumpedMessageId, setJumpedMessageId] = useState('')

  const normalizedHighlightedId = useMemo(() => String(highlightedMessageId || ''), [highlightedMessageId])
  const mediaItems = useMemo(() => (
    messages.flatMap((message, messageIndex) => (
      (Array.isArray(message.attachments) ? message.attachments : [])
        .filter((attachment) => ['image', 'video'].includes(String(attachment?.type || '').toLowerCase()))
        .map((attachment, attachmentIndex) => ({
          ...attachment,
          key: attachment?.key || `${message.id}-${attachment?.id || attachmentIndex}-${attachment?.url || ''}`,
          messageIndex,
          attachmentIndex,
        }))
    ))
  ), [messages])

  const syncScrollState = () => {
    const element = scrollRef.current
    if (!element) return
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 80
    wasNearBottomRef.current = isNearBottom
    setShowScrollToBottom(!isNearBottom && messages.length > 0)
  }

  const scrollToBottom = (behavior = 'smooth') => {
    const element = scrollRef.current
    if (!element) return
    element.scrollTo({ top: element.scrollHeight, behavior })
    wasNearBottomRef.current = true
    setShowScrollToBottom(false)
  }

  useEffect(() => {
    if (wasNearBottomRef.current) {
      scrollToBottom('smooth')
    }
  }, [messages.length])

  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage) return undefined

    const isLastOutgoing = isOutgoingMessage(lastMessage)
    const lastId = String(lastMessage?.id || '')
    if (!isLastOutgoing || !lastId) return undefined

    if (lastOutgoingMessageIdRef.current !== lastId) {
      lastOutgoingMessageIdRef.current = lastId
      const frameId = window.requestAnimationFrame(() => {
        scrollToBottom('smooth')
      })
      return () => window.cancelAnimationFrame(frameId)
    }

    return undefined
  }, [messages])

  useEffect(() => {
    if (autoScrollKey === undefined || autoScrollKey === null) return undefined
    const frameId = window.requestAnimationFrame(() => {
      scrollToBottom('auto')
    })
    return () => window.cancelAnimationFrame(frameId)
  }, [autoScrollKey])

  const openMediaGallery = (attachment) => {
    const key = attachment?.key || ''
    const index = mediaItems.findIndex((item) => item.key === key || item.url === attachment?.url)
    setActiveMediaIndex(index >= 0 ? index : 0)
  }

  const setMessageNode = (message, node) => {
    const ids = getMessageLookupIds(message)
    ids.forEach((id) => {
      if (node) {
        messageRefsRef.current.set(id, node)
      } else {
        messageRefsRef.current.delete(id)
      }
    })
  }

  const scrollToMessage = (messageId) => {
    const targetId = String(messageId || '')
    if (!targetId) return

    const targetNode = messageRefsRef.current.get(targetId)
    if (!targetNode) return

    targetNode.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setJumpedMessageId(targetId)
    window.setTimeout(() => {
      setJumpedMessageId((current) => (current === targetId ? '' : current))
    }, 1800)
  }

  return (
    <div className="relative min-h-0 flex-1 bg-[#F8FEFF]">
      <div ref={scrollRef} onScroll={syncScrollState} className="min-h-0 h-full space-y-3 overflow-y-auto p-3">
        {hasMoreMessages && (
          <button
            type="button"
            onClick={onLoadMore}
            className="mx-auto flex items-center gap-2 rounded-full border border-[#D9EEF0] bg-white px-3 py-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[#007A80]"
          >
            <RefreshCw size={13} />
            تحميل رسائل أقدم
          </button>
        )}

        {isLoadingMessages && (
          <div className="rounded-xl border border-[#D9EEF0] bg-white p-3 text-center text-xs font-semibold text-[var(--text-muted)]">
            جاري تحميل الرسائل...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        {!isLoadingMessages && messages.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#BEEFF2] bg-white/70 p-4 text-center text-xs font-semibold text-[var(--text-muted)]">
            <div>{emptyMessage}</div>
            {emptyDescription ? <div className="mt-1 text-[11px] text-[var(--text-muted)]/85">{emptyDescription}</div> : null}
          </div>
        )}

        {messages.map((message) => {
          const outgoing = isOutgoingMessage(message)
          const messageLookupIds = getMessageLookupIds(message)
          const isHighlighted = (
            normalizedHighlightedId && messageLookupIds.includes(normalizedHighlightedId)
          ) || (
            jumpedMessageId && messageLookupIds.includes(String(jumpedMessageId))
          )
          const timestampValue = message?.raw?.sent_at || message?.createdAt || message?.raw?.created_at
          const dateTimeLabel = formatDateTime12PreserveSource(timestampValue)
          const senderName = getSenderName(message)
          const statusLabel = getStatusLabel(message?.status)
          const showOutgoingMeta = outgoing && (senderName || dateTimeLabel || statusLabel)
          const attachments = Array.isArray(message.attachments) ? message.attachments : []
          const reactions = Array.isArray(message.reactions) ? message.reactions : []
          const replyLabel = getReplyLabel(message)
          const messageText = toDisplayText(message.text)
          const messageBackendId = getMessageBackendId(message)
          const replyTargetId = getReplyTargetId(message)

          return (
            <div
              key={message.id}
              ref={(node) => setMessageNode(message, node)}
              className={`flex ${outgoing ? 'justify-end' : 'justify-start'}`}
            >
              <div className="group relative max-w-[82%]">
                {(supportsReply || supportsReactions) ? (
                  <div className={`absolute top-1 z-10 hidden items-center gap-1 rounded-full border border-[#D8EEF2] bg-white/95 p-1 shadow-sm group-hover:flex ${outgoing ? '-start-16' : '-end-16'}`}>
                    {supportsReply ? (
                      <button
                        type="button"
                        onClick={() => onReply?.(message)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                        title="رد"
                      >
                        <Reply size={13} />
                      </button>
                    ) : null}
                    {supportsReactions ? (
                      <button
                        type="button"
                        onClick={() => setReactionPickerId((current) => (current === String(message.id) ? '' : String(message.id)))}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                        title="تفاعل"
                      >
                        <SmilePlus size={13} />
                      </button>
                    ) : null}
                  </div>
                ) : null}

                {reactionPickerId === String(message.id) ? (
                  <div className={`absolute -top-10 z-20 flex items-center gap-1 rounded-full border border-[#D8EEF2] bg-white p-1 shadow-lg ${outgoing ? 'end-0' : 'start-0'}`}>
                    {QUICK_REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          onReact?.({ messageId: messageBackendId, reaction: emoji })
                          setReactionPickerId('')
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-base hover:bg-[#F1F5F9]"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div
                  className={`rounded-2xl px-3 py-2 text-sm shadow-sm transition-all duration-700 ${
                    outgoing
                      ? 'rounded-br-md text-white'
                      : 'rounded-bl-md border border-[#E5F7F8] bg-white text-[var(--text)]'
                  } ${isHighlighted ? 'ring-2 ring-[#00C2CB] ring-offset-2 ring-offset-[#F8FEFF] shadow-[0_0_0_3px_rgba(0,194,203,0.12)]' : ''}`}
                  style={outgoing ? { backgroundColor: channelColor } : undefined}
                >
                  {isHighlighted && (
                    <div className={`mb-1 text-[10px] font-black ${outgoing ? 'text-white/85' : 'text-[#00878D]'}`}>
                      جديد
                    </div>
                  )}

                  {replyTargetId || replyLabel ? (
                    <button
                      type="button"
                      onClick={() => scrollToMessage(replyTargetId)}
                      className={`mb-2 block w-full rounded-xl border px-2 py-1.5 text-start text-xs font-semibold transition hover:scale-[1.01] ${
                      outgoing ? 'border-white/25 bg-white/15 text-white/85' : 'border-[#D8EEF2] bg-[#F8FEFF] text-[#475569]'
                    }`}
                      title="الانتقال للرسالة الأصلية"
                    >
                      <div className="mb-0.5 text-[10px] font-black opacity-80">رد على</div>
                      <div className="truncate">{replyLabel || `#${replyTargetId}`}</div>
                    </button>
                  ) : null}

                  {messageText ? <div className="whitespace-pre-wrap break-words">{messageText}</div> : null}
                  <MessengerMessageAttachments attachments={attachments} outgoing={outgoing} onOpenMedia={openMediaGallery} />
                </div>

                {reactions.length ? (
                  <div className={`mt-1 flex flex-wrap gap-1 ${outgoing ? 'justify-end' : 'justify-start'}`}>
                    {reactions.map((reaction, index) => {
                      const reactionText = toDisplayText(reaction?.emoji || reaction?.reaction)
                      const reactionOrigin = getReactionOrigin(reaction, message)
                      const reactionActorName = getReactionActorName(reaction, message, reactionOrigin)

                      return (
                        <MessageReactionBadge
                          key={`${reaction?.reactor_id || reaction?.reactorId || reaction?.user_id || index}-${reactionText}`}
                          reaction={reaction}
                          reactionText={reactionText}
                          reactionOrigin={reactionOrigin}
                          reactionActorName={reactionActorName}
                          onRemoveReaction={onRemoveReaction}
                          messageBackendId={messageBackendId}
                        />
                      )

                      return (
                        <span
                          key={`${reaction?.reactor_id || index}-${reactionText}`}
                          role={onRemoveReaction ? 'button' : undefined}
                          tabIndex={onRemoveReaction ? 0 : undefined}
                          onDoubleClick={() => onRemoveReaction?.({ messageId: messageBackendId, reaction: reactionText })}
                          onKeyDown={(event) => {
                            if (!onRemoveReaction) return
                            if (event.key === 'Delete' || event.key === 'Backspace') {
                              event.preventDefault()
                              onRemoveReaction({ messageId: messageBackendId, reaction: reactionText })
                            }
                          }}
                          className={`group/reaction relative inline-flex cursor-help items-center rounded-full border px-1.5 py-0.5 text-xs font-black ${getReactionClassName(reactionOrigin)}`}
                          title="اضغط مرتين لإزالة التفاعل"
                        >
                          <span className="pointer-events-none absolute bottom-[calc(100%+0.35rem)] start-1/2 z-40 hidden min-w-32 -translate-x-1/2 rounded-lg border border-[#D8E7EA] bg-white px-2 py-1 text-center text-[10px] font-black text-[#0F172A] shadow-xl group-hover/reaction:block">
                            {getReactionTitle(reactionOrigin, reactionActorName)}
                          </span>
                          {reactionText}
                        </span>
                      )
                    })}
                  </div>
                ) : null}

                {!outgoing && dateTimeLabel ? (
                  <div className="mt-1.5 flex items-center justify-start text-[10px] font-semibold text-[#64748B]">
                    <span>{dateTimeLabel}</span>
                  </div>
                ) : null}

                {showOutgoingMeta ? (
                  <div className="mt-1.5 flex items-center justify-end gap-2 text-[10px] font-semibold text-[#475569]">
                    {senderName ? <span className="max-w-[220px] truncate">{senderName}</span> : null}
                    {dateTimeLabel ? <span className="text-[#64748B]">{dateTimeLabel}</span> : null}
                    {statusLabel ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#DBEAFE] bg-[#F8FBFF] px-1.5 py-0.5 font-black text-[#0F172A]">
                        <MessageStatus status={message.status} />
                        {statusLabel}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-white px-1.5 py-0.5 text-[#475569]">
                        <MessageStatus status={message.status} />
                      </span>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      {showScrollToBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-3 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#CFE8EB] bg-white/95 px-3 py-1.5 text-xs font-black text-[#007A80] shadow-md backdrop-blur hover:bg-white"
          title="النزول لآخر رسالة"
        >
          <ArrowDown size={13} />
          آخر رسالة
        </button>
      )}

      <MessengerMediaGalleryDialog
        open={activeMediaIndex >= 0}
        items={mediaItems}
        activeIndex={activeMediaIndex}
        onIndexChange={setActiveMediaIndex}
        onClose={() => setActiveMediaIndex(-1)}
      />
    </div>
  )
}
