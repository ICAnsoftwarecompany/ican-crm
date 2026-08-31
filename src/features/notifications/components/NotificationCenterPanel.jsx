import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCheck, ExternalLink, Mail, MessageCircle, Trash2, X, Bell, ListFilter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../../shared/utils/cn'
import { useNotificationCenterStore } from '../store/notificationCenterStore'
import { MessengerLogoIcon } from '../../conversations/components/MessengerNavbarButton'
import { GmailLogoIcon } from '../../conversations/components/GmailNavbarButton'
import { WhatsappLogoIcon } from '../../conversations/components/WhatsappNavbarButton'

const CHANNELS = [
  { value: 'all', label: 'الكل' },
  { value: 'gmail', label: 'Gmail' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'messenger', label: 'Messenger' },
  { value: 'leads', label: 'Leads' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'system', label: 'System' },
]

function formatNotificationTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('ar-EG', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function getChannelMeta(channel = '') {
  if (channel === 'gmail') {
    return {
      label: 'Gmail',
      icon: <GmailLogoIcon size={18} />,
      accent: 'border-s-[#D93025]',
      chip: 'bg-[#FCE8E6] text-[#B3261E]',
      iconWrap: 'bg-[#FCE8E6] text-[#D93025]',
    }
  }

  if (channel === 'messenger') {
    return {
      label: 'Messenger',
      icon: <MessengerLogoIcon size={18} />,
      accent: 'border-s-[#1684FF]',
      chip: 'bg-[#E8F3FF] text-[#155EEF]',
      iconWrap: 'bg-[#E8F3FF] text-[#155EEF]',
    }
  }

  if (channel === 'whatsapp') {
    return {
      label: 'WhatsApp',
      icon: <WhatsappLogoIcon size={18} />,
      accent: 'border-s-[#25D366]',
      chip: 'bg-[#E9FFF2] text-[#087D3E]',
      iconWrap: 'bg-[#E9FFF2] text-[#087D3E]',
    }
  }

  if (channel === 'tasks') {
    return {
      label: 'Tasks',
      icon: <CheckCheck size={16} />,
      accent: 'border-s-[#7C3AED]',
      chip: 'bg-[#F3E8FF] text-[#6D28D9]',
      iconWrap: 'bg-[#F3E8FF] text-[#6D28D9]',
    }
  }

  if (channel === 'leads') {
    return {
      label: 'Leads',
      icon: <ListFilter size={16} />,
      accent: 'border-s-[#0F766E]',
      chip: 'bg-[#CCFBF1] text-[#0F766E]',
      iconWrap: 'bg-[#CCFBF1] text-[#0F766E]',
    }
  }

  return {
    label: 'System',
    icon: <Bell size={16} />,
    accent: 'border-s-[#64748B]',
    chip: 'bg-[#F1F5F9] text-[#475569]',
    iconWrap: 'bg-[#F1F5F9] text-[#475569]',
  }
}

function NotificationCard({ item, onOpen, onRead, onRemove }) {
  const meta = getChannelMeta(item.channel)

  return (
    <article
      className={cn(
        'group rounded-xl border border-[#E2E8F0] border-s-4 bg-white p-3 shadow-sm transition hover:border-[#CBD5E1] hover:shadow-md',
        meta.accent,
        !item.read && 'bg-[#F8FFFE]'
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn('inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', meta.iconWrap)}>
          {meta.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-sm font-black text-[#111827]">{item.title}</h3>
              {item.description ? (
                <p className="mt-1 line-clamp-3 text-xs font-semibold leading-5 text-[#64748B]">{item.description}</p>
              ) : null}
            </div>
            {!item.read ? (
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#14B8A6]" title="غير مقروء" />
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={cn('inline-flex h-6 items-center rounded-full px-2 text-[11px] font-black', meta.chip)}>
              {meta.label}
            </span>
            <span className="text-[11px] font-bold text-[#94A3B8]">{formatNotificationTime(item.createdAt)}</span>
            {item.temporary ? (
              <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-black text-[#92400E]">
                مؤقت
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
        {item.actionUrl ? (
          <button
            type="button"
            onClick={() => onOpen(item)}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#D8E7EA] bg-white px-2 text-xs font-black text-[#0F766E] hover:bg-[#ECFDF5]"
          >
            <ExternalLink size={13} />
            فتح
          </button>
        ) : null}
        {!item.read ? (
          <button
            type="button"
            onClick={() => onRead(item.id)}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2 text-xs font-black text-[#475569] hover:bg-[#F8FAFC]"
          >
            <CheckCheck size={13} />
            مقروء
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#FEE2E2] bg-white text-[#DC2626] hover:bg-[#FEF2F2]"
          aria-label="حذف التنبيه"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </article>
  )
}

export function NotificationCenterPanel({ open = false }) {
  const navigate = useNavigate()
  const panelRef = useRef(null)
  const [channel, setChannel] = useState('all')
  const items = useNotificationCenterStore((state) => state.items)
  const setOpen = useNotificationCenterStore((state) => state.setOpen)
  const markAsRead = useNotificationCenterStore((state) => state.markAsRead)
  const markAllRead = useNotificationCenterStore((state) => state.markAllRead)
  const removeNotification = useNotificationCenterStore((state) => state.removeNotification)
  const clearAll = useNotificationCenterStore((state) => state.clearAll)

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (event.target?.closest?.('[data-notification-center-root]')) return
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, setOpen])

  const sortedItems = useMemo(() => (
    [...items].sort((first, second) => (
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
    ))
  ), [items])

  const visibleItems = useMemo(() => (
    channel === 'all' ? sortedItems : sortedItems.filter((item) => item.channel === channel)
  ), [channel, sortedItems])

  const unreadCount = items.filter((item) => !item.read).length

  const handleOpen = (item) => {
    markAsRead(item.id)
    setOpen(false)
    if (item.actionUrl) navigate(item.actionUrl)
  }

  if (!open) return null

  return createPortal(
    <div
      ref={panelRef}
      data-notification-center-root
      className="fixed top-[56px] end-4 z-[120000] flex w-[min(520px,calc(100vw-24px))] max-h-[calc(100vh-72px)] flex-col overflow-hidden rounded-2xl border border-[#D8E7EA] bg-[#F8FAFC] shadow-2xl"
      dir="rtl"
    >
      <header className="border-b border-[#E2E8F0] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ECFDF5] text-[#0F766E]">
              <Bell size={20} />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-black text-[#111827]">مركز التنبيهات</h2>
              <p className="text-xs font-semibold text-[#64748B]">
                {items.length} تنبيه، {unreadCount} غير مقروء
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]"
            aria-label="إغلاق مركز التنبيهات"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {CHANNELS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setChannel(item.value)}
              className={cn(
                'h-8 rounded-full border px-3 text-xs font-black transition',
                channel === item.value
                  ? 'border-[#0F766E] bg-[#CCFBF1] text-[#0F766E]'
                  : 'border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={markAllRead}
            disabled={!unreadCount}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#D8E7EA] bg-white px-2 text-xs font-black text-[#0F766E] transition hover:bg-[#ECFDF5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={13} />
            تعيين الكل كمقروء
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={!items.length}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#FEE2E2] bg-white px-2 text-xs font-black text-[#DC2626] transition hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={13} />
            مسح الكل
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-3">
        {visibleItems.length ? (
          <div className="space-y-2">
            {visibleItems.map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
                onOpen={handleOpen}
                onRead={markAsRead}
                onRemove={removeNotification}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-[#CBD5E1] bg-white p-6 text-center">
            <div>
              <span className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F5F9] text-[#64748B]">
                <Mail size={20} />
              </span>
              <h3 className="text-sm font-black text-[#111827]">لا توجد تنبيهات هنا</h3>
              <p className="mt-1 text-xs font-semibold text-[#64748B]">أي تنبيه من realtime هيظهر في المكان ده تلقائيا.</p>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
