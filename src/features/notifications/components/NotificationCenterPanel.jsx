import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bell, CheckCheck, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../shared/utils/cn'
import { useNotificationCenterStore } from '../store/notificationCenterStore'
import { useMarkNotificationRead, useMarkNotificationsRead, useNotificationHistory, useUnreadNotifications } from '../hooks/useNotifications'
import { NotificationList } from './NotificationList'
import { NotificationTypeFilter } from './NotificationTypeFilter'

export function NotificationCenterPanel({ open = false }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const panelRef = useRef(null)
  const [tab, setTab] = useState('unread')
  const [typeFilter, setTypeFilter] = useState('all')
  const setOpen = useNotificationCenterStore((state) => state.setOpen)
  const unreadQuery = useUnreadNotifications()
  const historyQuery = useNotificationHistory({ enabled: open && tab === 'all' })
  const markRead = useMarkNotificationRead()
  const markManyRead = useMarkNotificationsRead()
  const unread = unreadQuery.data || []
  const activeQuery = tab === 'unread' ? unreadQuery : historyQuery
  const visibleNotifications = useMemo(() => {
    const notifications = activeQuery.data || []
    return typeFilter === 'all' ? notifications : notifications.filter((item) => item.type === typeFilter)
  }, [activeQuery.data, typeFilter])

  useEffect(() => {
    if (!open) return undefined
    const handlePointerDown = (event) => {
      if (event.target?.closest?.('[data-notification-center-root]')) return
      if (panelRef.current && !panelRef.current.contains(event.target)) setOpen(false)
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

  const handleOpen = (notification) => {
    if (!notification.isRead) markRead.mutate(notification.id)
    if (notification.target) {
      setOpen(false)
      navigate(notification.target)
    }
  }

  const handleMarkAll = () => {
    const ids = unread.map((item) => item.id)
    if (ids.length) markManyRead.mutate(ids)
  }

  if (!open) return null

  return createPortal(
    <section ref={panelRef} data-notification-center-root className="fixed inset-x-2 top-[56px] z-[120000] flex max-h-[calc(100vh-64px)] flex-col overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-2xl sm:start-auto sm:end-4 sm:w-[420px]" dir={i18n.dir()} aria-label={t('notifications.title')}>
      <header className="border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]"><Bell size={18} /></span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold">{t('notifications.title')}</h2>
              <p className="text-xs text-[var(--text-muted)]">{t('notifications.unreadCount', { count: unread.length })}</p>
            </div>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]" aria-label={t('notifications.actions.close')}><X size={16} /></button>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="inline-flex rounded-md bg-[var(--surface-2)] p-1" role="tablist">
            {['unread', 'all'].map((value) => <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={cn('h-8 rounded px-3 text-xs font-semibold text-[var(--text-muted)]', tab === value && 'bg-[var(--surface)] text-[var(--text)] shadow-sm')}>{t(`notifications.tabs.${value}`)}</button>)}
          </div>
          <button type="button" onClick={handleMarkAll} disabled={!unread.length || markManyRead.isPending} className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-[var(--brand-accent)] hover:bg-[var(--brand-accent-soft)] disabled:cursor-not-allowed disabled:opacity-45"><CheckCheck size={14} />{t('notifications.actions.markAllRead')}</button>
        </div>
        <div className="mt-2 flex justify-end"><NotificationTypeFilter value={typeFilter} onChange={setTypeFilter} /></div>
      </header>
      <div className="scrollbar-sidebar min-h-[280px] flex-1 overflow-y-auto">
        <NotificationList notifications={visibleNotifications} isLoading={activeQuery.isLoading} error={activeQuery.error} onRetry={activeQuery.refetch} onOpen={handleOpen} onRead={(id) => markRead.mutate(id)} isPending={markRead.isPending} emptyTitle={t(typeFilter !== 'all' ? 'notifications.empty.filteredTitle' : tab === 'unread' ? 'notifications.empty.unreadTitle' : 'notifications.empty.historyTitle')} emptyDescription={t(typeFilter !== 'all' ? 'notifications.empty.filteredDescription' : tab === 'unread' ? 'notifications.empty.unreadDescription' : 'notifications.empty.historyDescription')} t={t} />
      </div>
    </section>,
    document.body
  )
}
