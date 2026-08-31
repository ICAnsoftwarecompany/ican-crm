import { useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '../../../../../shared/utils/cn'
import { CallQuickAction } from '../tabs/TimeLineTap/CallsTap/CallAction/CallQuickAction'
import { EmailQuickAction } from './EmailQuickAction'
import { FollowUpQuickAction } from './FollowUpQuickAction'
import { MeetingQuickAction } from '../tabs/TimeLineTap/MeetingTap/MeetingAction/MeetingQuickAction'
import { MessengerQuickAction } from './MessengerQuickAction'
import { SmsQuickAction } from './SmsQuickAction'
import { WhatsappQuickAction } from './WhatsappQuickAction'

const STORAGE_KEY = 'customer-details-quick-actions-order'
const LONG_PRESS_MS = 280

const ACTIONS = [
  {
    id: 'follow-up',
    render: (props) => (
      <FollowUpQuickAction
        customer={props.customer}
        currentStatus={props.currentStatus}
        onFollowUpAdded={props.onFollowUpAdded}
      />
    ),
  },
  {
    id: 'call',
    render: (props) => <CallQuickAction customer={props.customer} onTimelineAction={props.onTimelineAction} />,
  },
  {
    id: 'meeting',
    render: (props) => <MeetingQuickAction customer={props.customer} onTimelineAction={props.onTimelineAction} />,
  },
  {
    id: 'sms',
    render: (props) => <SmsQuickAction onOpenChat={props.onOpenChat} />,
  },
  {
    id: 'whatsapp',
    render: (props) => <WhatsappQuickAction onOpenChat={props.onOpenChat} />,
  },
  {
    id: 'messenger',
    render: (props) => <MessengerQuickAction onOpenChat={props.onOpenChat} />,
  },
  {
    id: 'email',
    render: (props) => <EmailQuickAction onOpenChat={props.onOpenChat} />,
  },
]

function ensureFollowUpBeforeCall(order) {
  const nextOrder = order.filter(Boolean)
  const followUpIndex = nextOrder.indexOf('follow-up')
  const callIndex = nextOrder.indexOf('call')

  if (followUpIndex === -1 || callIndex === -1 || followUpIndex < callIndex) return nextOrder

  const [followUp] = nextOrder.splice(followUpIndex, 1)
  const nextCallIndex = nextOrder.indexOf('call')
  nextOrder.splice(Math.max(nextCallIndex, 0), 0, followUp)
  return nextOrder
}

function getStoredOrder() {
  if (typeof window === 'undefined') return ACTIONS.map((action) => action.id)

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(parsed)) return ACTIONS.map((action) => action.id)

    const actionIds = new Set(ACTIONS.map((action) => action.id))
    const storedIds = parsed.filter((id) => actionIds.has(id))
    const missingIds = ACTIONS.map((action) => action.id).filter((id) => !storedIds.includes(id))

    if (!storedIds.includes('follow-up') && missingIds.includes('follow-up')) {
      return ensureFollowUpBeforeCall(['follow-up', ...storedIds, ...missingIds.filter((id) => id !== 'follow-up')])
    }

    return ensureFollowUpBeforeCall([...storedIds, ...missingIds])
  } catch {
    return ensureFollowUpBeforeCall(ACTIONS.map((action) => action.id))
  }
}

function saveOrder(order) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(order))
}

function moveItem(items, sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return items

  const sourceIndex = items.indexOf(sourceId)
  const targetIndex = items.indexOf(targetId)
  if (sourceIndex === -1 || targetIndex === -1) return items

  const nextItems = [...items]
  const [moved] = nextItems.splice(sourceIndex, 1)
  nextItems.splice(targetIndex, 0, moved)
  return nextItems
}

export function CustomerQuickActions({ customer, currentStatus, onTimelineAction, onOpenChat, onFollowUpAdded }) {
  const longPressTimerRef = useRef(null)
  const recentDragTimerRef = useRef(null)
  const [order, setOrder] = useState(getStoredOrder)
  const [draggingId, setDraggingId] = useState(null)
  const [recentlyDragged, setRecentlyDragged] = useState(false)

  const orderedActions = useMemo(() => {
    const actionById = new Map(ACTIONS.map((action) => [action.id, action]))
    return order.map((id) => actionById.get(id)).filter(Boolean)
  }, [order])

  useEffect(() => {
    saveOrder(order)
  }, [order])

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current)
      if (recentDragTimerRef.current) window.clearTimeout(recentDragTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!draggingId) return undefined

    const stopDrag = () => finishDrag()
    window.addEventListener('pointerup', stopDrag)
    window.addEventListener('pointercancel', stopDrag)

    return () => {
      window.removeEventListener('pointerup', stopDrag)
      window.removeEventListener('pointercancel', stopDrag)
    }
  }, [draggingId])

  const clearLongPressTimer = () => {
    if (!longPressTimerRef.current) return
    window.clearTimeout(longPressTimerRef.current)
    longPressTimerRef.current = null
  }

  const startLongPress = (actionId) => {
    clearLongPressTimer()
    longPressTimerRef.current = window.setTimeout(() => {
      setDraggingId(actionId)
      setRecentlyDragged(true)
    }, LONG_PRESS_MS)
  }

  const finishDrag = () => {
    clearLongPressTimer()
    if (!draggingId) return

    setDraggingId(null)
    if (recentDragTimerRef.current) window.clearTimeout(recentDragTimerRef.current)
    recentDragTimerRef.current = window.setTimeout(() => {
      setRecentlyDragged(false)
    }, 220)
  }

  const handleEnterAction = (targetId) => {
    if (!draggingId || draggingId === targetId) return
    setOrder((currentOrder) => moveItem(currentOrder, draggingId, targetId))
  }

  return (
    <div className="-mx-1 mt-3 overflow-x-auto px-1 pb-1">
      <div className="flex min-w-max items-center gap-1">
        {orderedActions.map((action) => (
          <div
            key={action.id}
            onPointerDown={() => startLongPress(action.id)}
            onPointerMove={() => {
              if (!draggingId) return
              setRecentlyDragged(true)
            }}
            onPointerUp={finishDrag}
            onPointerCancel={finishDrag}
            onPointerLeave={clearLongPressTimer}
            onPointerEnter={() => handleEnterAction(action.id)}
            onClickCapture={(event) => {
              if (!draggingId && !recentlyDragged) return
              event.preventDefault()
              event.stopPropagation()
            }}
            className={cn(
              'touch-pan-x select-none rounded-lg transition-transform duration-150',
              draggingId === action.id && 'scale-105 opacity-80 ring-2 ring-[#00C2CB] ring-offset-2',
              draggingId && draggingId !== action.id && 'cursor-grabbing'
            )}
          >
            {action.render({ customer, currentStatus, onTimelineAction, onOpenChat, onFollowUpAdded })}
          </div>
        ))}
      </div>
    </div>
  )
}
