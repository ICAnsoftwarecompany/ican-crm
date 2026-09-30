import { useTranslation } from 'react-i18next'
import { cn } from '../../../../shared/utils/cn'

export const INCIDENT_STATUSES = ['investigating', 'identified', 'monitoring', 'resolved']
export const INCIDENT_SEVERITIES = ['minor', 'major', 'critical']
const STATUS_TONE = { investigating: 'text-sla-breached', identified: 'text-sla-at-risk', monitoring: 'text-brand-accent', resolved: 'text-sla-on-track' }
const SEVERITY_TONE = { minor: 'border-[var(--border)] text-[var(--text-muted)]', major: 'border-sla-at-risk text-sla-at-risk', critical: 'border-sla-breached text-sla-breached' }

export function IncidentStatus({ status }) {
  const { t } = useTranslation()
  return <span className={cn('text-xs font-semibold', STATUS_TONE[status])}>{t(`service.incidents.statuses.${status}`)}</span>
}

export function IncidentSeverity({ severity }) {
  const { t } = useTranslation()
  return <span className={cn('rounded-full border px-2 py-0.5 text-xs', SEVERITY_TONE[severity])}>{t(`service.incidents.severities.${severity}`)}</span>
}
