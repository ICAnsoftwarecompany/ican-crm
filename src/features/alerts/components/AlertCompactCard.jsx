import { Check, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatNotificationTime } from '../../notifications/utils/notificationTime'

export function AlertCompactCard({ alert, index, onAcknowledge, pending }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const Icon = alert.icon
  const tone = ['critical', 'warning', 'info'].includes(alert.severity) ? alert.severity : 'system'
  const color = `var(--notification-${tone})`

  return (
    <article className="alert-stack-card rounded-md border border-[var(--border)] bg-[var(--surface)] p-3 shadow-md" style={{ '--alert-index': index, '--alert-color': color }}>
      <div className="flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md" style={{ color, backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}><Icon size={16} /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2"><h3 className="line-clamp-1 flex-1 text-xs font-bold text-[var(--text)]">{alert.title || t('alerts.fallbackTitle')}</h3><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} /></div>
          <p className="mt-1 line-clamp-1 text-[11px] text-[var(--text-muted)]">{alert.message}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <time className="text-[10px] text-[var(--text-light)]">{formatNotificationTime(alert.createdAt, i18n.language, t)}</time>
            <div className="flex items-center gap-1">
              {alert.target && <button type="button" onClick={() => navigate(alert.target)} className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--brand-accent)] hover:bg-[var(--surface-2)]" aria-label={t(alert.actionKey)} title={t(alert.actionKey)}><ExternalLink size={13} /></button>}
              <button type="button" disabled={pending} onClick={() => onAcknowledge(alert.id)} className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] disabled:opacity-50" aria-label={t('alerts.actions.acknowledge')} title={t('alerts.actions.acknowledge')}><Check size={13} /></button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
