import { useTranslation } from 'react-i18next'
import { AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '../../../../../shared/utils/cn'

export const inputClassName = (hasError) => cn(
  'w-full h-10 rounded-lg border bg-[var(--surface)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--text-light)]',
  'transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)] focus:border-transparent',
  'disabled:cursor-not-allowed disabled:opacity-60',
  hasError ? 'border-[var(--notification-danger)]' : 'border-[var(--border)]'
)

const ISSUE_STYLE = {
  error: { icon: AlertCircle, className: 'text-[var(--notification-danger)]' },
  warning: { icon: AlertTriangle, className: 'text-[var(--notification-warning)]' },
  info: { icon: Info, className: 'text-[var(--text-muted)]' },
}

export function IssueMessage({ issue, className }) {
  const { t } = useTranslation()
  if (!issue) return null
  const style = ISSUE_STYLE[issue.severity] || ISSUE_STYLE.info
  const Icon = style.icon
  return (
    <p role={issue.severity === 'error' ? 'alert' : undefined} className={cn('flex items-start gap-1.5 text-xs leading-5', style.className, className)}>
      <Icon size={13} className="mt-1 shrink-0" />
      <span>{t(`campaignWizard.issues.${issue.code}`, issue.params)}</span>
    </p>
  )
}

/** Label + control + hint/issue. `required` adds a star; `optional` adds a muted "Optional". */
export function FieldFrame({ label, htmlFor, hint, issue, required, optional, action, children, className, fieldProps }) {
  const { t } = useTranslation()
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)} data-wizard-field={fieldProps?.['data-wizard-field']}>
      {(label || action) && (
        <div className="flex items-center justify-between gap-2">
          {label && (
            <label htmlFor={htmlFor} className="text-sm font-medium text-[var(--text)]">
              {label}
              {required && <span className="ms-1 text-[var(--notification-danger)]" aria-hidden="true">*</span>}
              {optional && <span className="ms-1.5 text-xs font-normal text-[var(--text-light)]">{t('campaignWizard.common.optional')}</span>}
            </label>
          )}
          {action}
        </div>
      )}
      {children}
      {issue ? <IssueMessage issue={issue} /> : hint ? <p className="text-xs leading-5 text-[var(--text-muted)]">{hint}</p> : null}
    </div>
  )
}
