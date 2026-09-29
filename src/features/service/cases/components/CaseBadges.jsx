import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowRight, ArrowUp, Flame } from 'lucide-react'
import { cn } from '../../../../shared/utils/cn'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { PRIORITY_TONE, STATUS_CATEGORY_TONE } from '../utils/caseStatus'

export function CaseStatusBadge({ status, className }) {
  const { i18n } = useTranslation()
  if (!status) return <span className="text-xs text-[var(--text-muted)]">-</span>
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-xs font-medium text-[var(--text)]',
        className
      )}
    >
      <span className={cn('h-2 w-2 shrink-0 rounded-full', STATUS_CATEGORY_TONE[status.category] || 'bg-[var(--text-muted)]')} aria-hidden="true" />
      {localizeLabel(status.label, i18n.language, status.key)}
    </span>
  )
}

const PRIORITY_ICON = { low: ArrowDown, normal: ArrowRight, high: ArrowUp, urgent: Flame }

export function CasePriorityBadge({ priority, showLabel = true }) {
  const { t } = useTranslation()
  if (!priority) return <span className="text-xs text-[var(--text-muted)]">-</span>
  const Icon = PRIORITY_ICON[priority] || ArrowRight
  const label = t(`service.cases.priority.${priority}`, { defaultValue: priority })
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', PRIORITY_TONE[priority])} title={label}>
      <Icon size={14} aria-hidden="true" className="rtl:-scale-x-100" />
      {showLabel ? label : <span className="sr-only">{label}</span>}
    </span>
  )
}
