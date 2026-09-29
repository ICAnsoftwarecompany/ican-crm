import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAlerts } from '../hooks/useAlerts'
import { OPEN_ALERTS_DRAWER_EVENT } from './AlertsStack'

export function AlertsIndicator() {
  const { t } = useTranslation()
  const { data: alerts = [] } = useAlerts()
  if (!alerts.length) return null
  return <button type="button" onClick={() => window.dispatchEvent(new CustomEvent(OPEN_ALERTS_DRAWER_EVENT))} className="relative inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--notification-warning)] bg-[var(--surface)] px-2 text-xs font-bold text-[var(--notification-warning)] hover:bg-[var(--surface-2)]" aria-label={t('alerts.indicatorLabel', { count: alerts.length })} title={t('alerts.title')}><AlertTriangle size={15} /><span>{alerts.length > 99 ? '99+' : alerts.length}</span></button>
}
