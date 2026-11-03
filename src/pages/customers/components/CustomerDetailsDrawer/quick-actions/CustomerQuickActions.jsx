import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '../../../../../shared/utils/cn'
import { CallQuickAction, MeetingQuickAction } from '../../../../../features/call-meetings'
import { EmailQuickAction } from './EmailQuickAction'
import { FollowUpQuickAction } from './FollowUpQuickAction'
import { AddInterestQuickAction } from './interests'
import { MessengerQuickAction } from './MessengerQuickAction'
import { LostQuickAction, WonQuickAction } from './OutcomeQuickActions'
import { SmsQuickAction } from './SmsQuickAction'
import { StatusQuickAction } from './StatusQuickAction'
import { WhatsappQuickAction } from './WhatsappQuickAction'
import { QuickActionButton } from './QuickActionButton'
import { useLeadTaskAction } from '../../../../../features/lead-tasks'
import { AtSign, ListTodo } from 'lucide-react'
import { MentionComposer } from '../../../../../features/mentions/components/MentionComposer'
import { useTranslation } from 'react-i18next'

function TaskQuickAction({ customer }) {
  const { t } = useTranslation()
  const task = useLeadTaskAction()
  return <><QuickActionButton icon={ListTodo} label={t('customers.leadTasks.add')} onClick={() => task.open(customer)} disabled={!customer?.lead_id && !customer?.lead?.id} />{task.dialog}</>
}

function MentionQuickAction({ customer }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const entityId = customer?.id

  return (
    <div className="relative">
      <QuickActionButton icon={AtSign} label={t('mentions.create')} onClick={() => setOpen((value) => !value)} disabled={entityId == null || entityId === ''} />
      {open && createPortal(
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }} onPointerDown={(event) => event.stopPropagation()}>
          <section role="dialog" aria-label={t('mentions.create')} className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-[var(--text)] shadow-xl" onPointerDown={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold">{t('mentions.create')}</h3>
              <button type="button" onClick={() => setOpen(false)} className="rounded-md px-2 py-1 text-sm" aria-label="Close">×</button>
            </div>
            <MentionComposer entityType="customer" entityId={entityId} onCreated={() => setOpen(false)} />
          </section>
        </div>,
        document.body
      )}
    </div>
  )
}

const STORAGE_KEY = 'customer-details-quick-actions-order:v2'
const LONG_PRESS_MS = 280

const ACTIONS = [
  { id: 'mention', render: (props) => <MentionQuickAction customer={props.customer} /> },
  { id: 'task', render: (props) => <TaskQuickAction customer={props.customer} /> },
  {
    id: 'follow-up',
    render: (props) => (
      <FollowUpQuickAction
        customer={props.customer}
        currentStatus={props.currentStatus}
        statuses={props.statuses}
        onFollowUpAdded={props.onFollowUpAdded}
      />
    ),
  },
  {
    id: 'status',
    render: (props) => (
      <StatusQuickAction
        customer={props.customer}
        currentStatus={props.currentStatus}
        statuses={props.statuses}
        onChanged={props.onStatusChanged}
      />
    ),
  },
  {
    id: 'interest',
    render: (props) => (
      <AddInterestQuickAction
        customer={props.customer}
        onInterestChanged={props.onInterestChanged}
      />
    ),
  },
  // Won / lost outside a deal board (2026-10-15).
  { id: 'won', render: (props) => <WonQuickAction customer={props.customer} onDone={() => props.onStatusChanged?.()} /> },
  { id: 'lost', render: (props) => <LostQuickAction customer={props.customer} onDone={() => props.onStatusChanged?.()} /> },
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
  const statusIndex = nextOrder.indexOf('status')
  const callIndex = nextOrder.indexOf('call')

  if (followUpIndex !== -1 && statusIndex !== -1 && followUpIndex > statusIndex) {
    const [followUp] = nextOrder.splice(followUpIndex, 1)
    const nextStatusIndex = nextOrder.indexOf('status')
    nextOrder.splice(Math.max(nextStatusIndex, 0), 0, followUp)
  }

  const nextFollowUpIndex = nextOrder.indexOf('follow-up')
  const nextStatusIndex = nextOrder.indexOf('status')
  const nextCallIndex = nextOrder.indexOf('call')

  if (nextStatusIndex !== -1 && nextCallIndex !== -1 && nextStatusIndex > nextCallIndex) {
    const [status] = nextOrder.splice(nextStatusIndex, 1)
    const updatedCallIndex = nextOrder.indexOf('call')
    nextOrder.splice(Math.max(updatedCallIndex, 0), 0, status)
  }

  if (nextFollowUpIndex === -1 || nextCallIndex === -1 || nextFollowUpIndex < nextCallIndex) return nextOrder

  const [followUp] = nextOrder.splice(nextFollowUpIndex, 1)
  const updatedCallIndex = nextOrder.indexOf('call')
  nextOrder.splice(Math.max(updatedCallIndex, 0), 0, followUp)
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

export function CustomerQuickActions({
  customer,
  currentStatus,
  statuses = [],
  onTimelineAction,
  onOpenChat,
  onFollowUpAdded,
  onStatusChanged,
  onInterestChanged,
  className,
  onlyIds,
  actionOverrides,
}) {
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
    <div className={cn('-mx-1 mt-3 overflow-x-auto px-1 pb-0.5', className)}>
      <div className="flex min-w-max items-center gap-1">
        {orderedActions.filter((action) => (!onlyIds || onlyIds.includes(action.id)) && actionOverrides?.[action.id] !== null).map((action) => (
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
            {actionOverrides?.[action.id] ? <QuickActionButton {...actionOverrides[action.id]} /> : action.render({
              customer,
              currentStatus,
              statuses,
              onTimelineAction,
              onOpenChat,
              onFollowUpAdded,
              onStatusChanged,
              onInterestChanged,
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
