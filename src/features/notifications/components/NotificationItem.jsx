import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../shared/utils/cn'
import { formatNotificationTime } from '../utils/notificationTime'

export function NotificationItem({ notification, onOpen, onRead, isPending }) {
  const { t, i18n } = useTranslation()
  const Icon = notification.icon
  const title = notification.title || t(notification.titleKey)
  const severityLabel = t(`notifications.severity.${notification.severity}`, { defaultValue: notification.severity })
  const fullDate = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(notification.createdAt))

  return (
    <article className={cn('group relative flex gap-3 border-b border-[var(--border)] px-4 py-3 transition-colors last:border-b-0 hover:bg-[var(--surface-2)]', !notification.isRead && 'bg-[var(--brand-accent-soft)]/40')}>
      <button type="button" onClick={() => onOpen(notification)} className="flex min-w-0 flex-1 items-start gap-3 text-start" aria-label={t('notifications.actions.open', { title })}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md" style={{ color: notification.iconColor, backgroundColor: `color-mix(in srgb, ${notification.iconColor} 14%, transparent)` }}><Icon size={17} /></span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start gap-2">
            <strong className="line-clamp-1 flex-1 text-sm text-[var(--text)]">{title}</strong>
            {!notification.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--brand-accent)]" aria-label={t('notifications.unread')} />}
          </span>
          <span className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--text-muted)]">{notification.message || t('notifications.fallbackMessage')}</span>
          <span className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-muted)]">{t(notification.areaKey)}</span>
            {notification.hasSeverity && <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ color: notification.iconColor, backgroundColor: `color-mix(in srgb, ${notification.iconColor} 12%, transparent)` }}>{severityLabel}</span>}
          </span>
          <time className="mt-1 block text-[11px] text-[var(--text-light)]" dateTime={notification.createdAt} title={fullDate}>{formatNotificationTime(notification.createdAt, i18n.language, t)}</time>
        </span>
      </button>
      {!notification.isRead && (
        <button type="button" disabled={isPending} onClick={() => onRead(notification.id)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] opacity-100 hover:bg-[var(--surface)] hover:text-[var(--brand-accent)] md:opacity-0 md:group-hover:opacity-100" aria-label={t('notifications.actions.markRead')} title={t('notifications.actions.markRead')}><Check size={15} /></button>
      )}
    </article>
  )
}
