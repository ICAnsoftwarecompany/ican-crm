import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { useDirection } from '../../../../../../shared/hooks/useDirection'
import { FloatingChatHeader } from './FloatingChatHeader'
import { FloatingChatResizeHandles } from './FloatingChatResizeHandles'
import { MessengerChatThread } from '../../../../../../features/conversations/components/MessengerChatThread'
import {
  calculateResizedLayout,
  clampLayoutToViewport,
  getDefaultChatLayout,
  getMaximizedLayout,
  getSavedChatLayout,
  saveChatLayout,
} from './utils/floatingChatLayout'

function isInteractiveElement(element) {
  return Boolean(element?.closest?.('button, a, input, textarea, select, [data-resize-handle="true"]'))
}

function getResponsiveLayout(layout) {
  if (typeof window === 'undefined' || window.innerWidth > 640) return clampLayoutToViewport(layout)

  return {
    ...layout,
    x: 8,
    y: 8,
    width: window.innerWidth - 16,
    height: window.innerHeight - 16,
    isMinimized: layout.isMinimized,
  }
}

export function FloatingCustomerChat({
  open,
  channel = 'chat',
  channelLabel = 'Chat',
  channelIcon,
  channelColor = '#00C2CB',
  customer,
  messages = [],
  isLoadingMessages = false,
  isSending = false,
  error = '',
  onClose,
  onSend,
  onReact,
  onRemoveReaction,
  onLoadMore,
  hasMoreMessages = false,
  highlightedMessageId = '',
  supportsAttachments = false,
  supportsReply = false,
  supportsReactions = false,
  onOpenSidebar,
  openSidebarTitle,
  zIndex = 20000,
  onFocus,
}) {
  const dir = useDirection()
  const interactionRef = useRef(null)
  const layoutRef = useRef(null)
  const previousLayoutRef = useRef(null)
  const [layout, setLayoutState] = useState(() => getSavedChatLayout(channel, dir))

  const setLayout = useCallback((nextLayout) => {
    const value = getResponsiveLayout(nextLayout)
    layoutRef.current = value
    setLayoutState(value)
  }, [])

  useEffect(() => {
    if (!open) return
    setLayout(getSavedChatLayout(channel, dir))
  }, [channel, dir, open, setLayout])

  useEffect(() => {
    layoutRef.current = layout
  }, [layout])

  useEffect(() => {
    if (!open) return undefined

    const handleResize = () => {
      setLayout(layoutRef.current || getSavedChatLayout(channel, dir))
      saveChatLayout(channel, layoutRef.current)
    }

    const handleEscape = (event) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation?.()
      onClose?.()
    }

    window.addEventListener('resize', handleResize)
    document.addEventListener('keydown', handleEscape, true)

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('keydown', handleEscape, true)
    }
  }, [channel, dir, onClose, open, setLayout])

  const handlePointerMove = useCallback((event) => {
    const interaction = interactionRef.current
    if (!interaction) return

    if (interaction.type === 'drag') {
      setLayout({
        ...interaction.startLayout,
        x: interaction.startLayout.x + event.clientX - interaction.startPointer.x,
        y: interaction.startLayout.y + event.clientY - interaction.startPointer.y,
        isMaximized: false,
      })
      return
    }

    if (interaction.type === 'resize') {
      setLayout(calculateResizedLayout({
        direction: interaction.direction,
        startPointer: interaction.startPointer,
        currentPointer: { x: event.clientX, y: event.clientY },
        startLayout: interaction.startLayout,
      }))
    }
  }, [setLayout])

  const endInteraction = useCallback(() => {
    if (!interactionRef.current) return
    interactionRef.current = null
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
    saveChatLayout(channel, layoutRef.current)
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', endInteraction)
    window.removeEventListener('pointercancel', endInteraction)
  }, [channel, handlePointerMove])

  const beginInteraction = useCallback((type, event, direction = null) => {
    if (event.button !== undefined && event.button !== 0) return
    if (isInteractiveElement(event.target)) return

    onFocus?.()
    event.preventDefault()
    event.stopPropagation()

    interactionRef.current = {
      type,
      direction,
      pointerId: event.pointerId,
      startPointer: { x: event.clientX, y: event.clientY },
      startLayout: layoutRef.current || layout,
    }

    document.body.style.userSelect = 'none'
    document.body.style.cursor = type === 'drag' ? 'grabbing' : 'nwse-resize'
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', endInteraction)
    window.addEventListener('pointercancel', endInteraction)
  }, [endInteraction, handlePointerMove, layout, onFocus])

  const handleDragStart = (event) => {
    beginInteraction('drag', event)
  }

  const handleResizeStart = (direction, event) => {
    beginInteraction('resize', event, direction)
  }

  const persistLayout = (nextLayout) => {
    setLayout(nextLayout)
    saveChatLayout(channel, nextLayout)
  }

  const minimize = () => {
    previousLayoutRef.current = { ...layout, isMinimized: false }
    persistLayout({ ...layout, isMinimized: true })
  }

  const maximize = () => {
    previousLayoutRef.current = { ...layout, isMaximized: false, isMinimized: false }
    persistLayout(getMaximizedLayout())
  }

  const restore = () => {
    persistLayout(previousLayoutRef.current || { ...layout, isMinimized: false, isMaximized: false })
  }

  const reset = () => {
    const nextLayout = getDefaultChatLayout(dir, channel)
    previousLayoutRef.current = null
    persistLayout(nextLayout)
  }

  if (!open || typeof document === 'undefined') return null

  const resolvedHeight = layout.isMinimized ? 64 : layout.height
  const resizeDisabled = layout.isMinimized || layout.isMaximized || (typeof window !== 'undefined' && window.innerWidth <= 640)

  return createPortal(
    <div className="pointer-events-none fixed inset-0" style={{ zIndex }}>
      <div
        role="dialog"
        aria-label={`${channelLabel} محادثة العميل`}
        className="pointer-events-auto fixed overflow-hidden rounded-2xl border border-[#BEEFF2] bg-[var(--surface)] shadow-2xl"
        onPointerDownCapture={onFocus}
        style={{
          left: 0,
          top: 0,
          width: layout.width,
          height: resolvedHeight,
          transform: `translate3d(${layout.x}px, ${layout.y}px, 0)`,
        }}
      >
        <FloatingChatHeader
          customer={customer}
          channelLabel={channelLabel}
          channelIcon={channelIcon}
          channelColor={channelColor}
          isMinimized={layout.isMinimized}
          isMaximized={layout.isMaximized}
          onMinimize={minimize}
          onMaximize={maximize}
          onRestore={restore}
          onReset={reset}
          onClose={onClose}
          onOpenSidebar={onOpenSidebar}
          openSidebarTitle={openSidebarTitle}
          onDragStart={handleDragStart}
        />

        {!layout.isMinimized && (
          <div className="flex h-[calc(100%-64px)] min-h-0 flex-col">
            <MessengerChatThread
              title={customer?.name || 'عميل'}
              contactText={customer?.phone || customer?.email || 'بدون بيانات تواصل'}
              avatarUrl={customer?.profile_picture || customer?.avatar || ''}
              contactDetails={{
                name: customer?.name || 'عميل',
                contact: customer?.phone || customer?.email || 'بدون بيانات تواصل',
                phone: customer?.phone || '',
                email: customer?.email || '',
                channel: channelLabel,
                conversationId: customer?.conversation_id || customer?.conversationId || '',
              }}
              messages={messages}
              isLoadingMessages={isLoadingMessages}
              error={error}
              hasMoreMessages={hasMoreMessages}
              onLoadMore={onLoadMore}
              isSending={isSending}
              onSend={onSend}
              onReact={onReact}
              onRemoveReaction={onRemoveReaction}
              channelColor={channelColor}
              autoFocusKey={customer?.id || customer?.phone || customer?.email || channel}
              highlightedMessageId={highlightedMessageId}
              supportsAttachments={supportsAttachments}
              supportsReply={supportsReply}
              supportsReactions={supportsReactions}
            />
          </div>
        )}

        <FloatingChatResizeHandles disabled={resizeDisabled} onResizeStart={handleResizeStart} />
      </div>
    </div>,
    document.body
  )
}
