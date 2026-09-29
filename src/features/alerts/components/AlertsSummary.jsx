import { useTranslation } from 'react-i18next'

export function AlertsSummary({ alerts }) {
  const { t } = useTranslation()
  const counts = alerts.reduce((result, alert) => ({ ...result, [alert.severity]: (result[alert.severity] || 0) + 1 }), {})
  return <div className="flex flex-wrap gap-2">{Object.entries(counts).map(([severity, count]) => <span key={severity} className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs text-[var(--text-muted)]">{t(`alerts.severity.${severity}`, { defaultValue: severity })}: <strong className="text-[var(--text)]">{count}</strong></span>)}</div>
}
