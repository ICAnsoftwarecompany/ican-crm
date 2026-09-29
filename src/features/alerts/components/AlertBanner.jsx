import { Check, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../shared/utils/cn'
import { formatNotificationTime } from '../../notifications/utils/notificationTime'

const severityClasses = {
  critical: 'border-[var(--notification-critical)] bg-[color-mix(in_srgb,var(--notification-critical)_8%,var(--surface))]',
  warning: 'border-[var(--notification-warning)] bg-[color-mix(in_srgb,var(--notification-warning)_8%,var(--surface))]',
  info: 'border-[var(--notification-info)] bg-[color-mix(in_srgb,var(--notification-info)_8%,var(--surface))]',
}

export function AlertBanner({ alert, onAcknowledge, compact = false, pending = false, onNavigate }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const Icon = alert.icon
  const color = `var(--notification-${['critical', 'warning', 'info'].includes(alert.severity) ? alert.severity : 'system'})`
  const openTarget = () => { if (alert.target) navigate(alert.target); onNavigate?.() }

  return (
    <article className={cn('rounded-md border-s-4 border border-[var(--border)] p-3', severityClasses[alert.severity] || severityClasses.info)}>
      <div className="flex items-start gap-3">
        <Icon size={18} className="mt-0.5 shrink-0" style={{ color }} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold text-[var(--text)]">{alert.title || t('alerts.fallbackTitle')}</h3><span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ color, backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}>{t(`alerts.severity.${alert.severity}`, { defaultValue: alert.severity })}</span></div>
          {!compact && <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{alert.message}</p>}
          <p className="mt-1 text-[11px] text-[var(--text-light)]">{formatNotificationTime(alert.createdAt, i18n.language, t)}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {alert.target && <button type="button" onClick={openTarget} className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-[var(--brand-accent)] hover:bg-[var(--surface)]"><ExternalLink size={13} />{t(alert.actionKey)}</button>}
            <button type="button" disabled={pending} onClick={() => onAcknowledge(alert.id)} className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)] disabled:opacity-50"><Check size={13} />{t('alerts.actions.acknowledge')}</button>
          </div>
        </div>
      </div>
    </article>
  )
}
