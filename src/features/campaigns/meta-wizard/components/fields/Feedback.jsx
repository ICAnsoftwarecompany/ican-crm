import { useTranslation } from 'react-i18next'
import { AlertTriangle, FlaskConical, Info, Lightbulb, OctagonAlert } from 'lucide-react'
import { cn } from '../../../../../shared/utils/cn'

const CALLOUT = {
  info: { icon: Info, className: 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)]' },
  tip: { icon: Lightbulb, className: 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--text)]' },
  warning: { icon: AlertTriangle, className: 'border-[var(--notification-warning)] bg-[var(--surface-2)] text-[var(--text)]' },
  danger: { icon: OctagonAlert, className: 'border-[var(--notification-danger)] bg-[var(--surface-2)] text-[var(--text)]' },
}

const CALLOUT_ICON_COLOR = {
  info: 'text-[var(--text-muted)]',
  tip: 'text-[var(--brand-accent)]',
  warning: 'text-[var(--notification-warning)]',
  danger: 'text-[var(--notification-danger)]',
}

export function Callout({ tone = 'info', title, children, action, className }) {
  const style = CALLOUT[tone] || CALLOUT.info
  const Icon = style.icon
  return (
    <div className={cn('flex items-start gap-3 rounded-lg border p-3 text-sm', style.className, className)}>
      <Icon size={16} className={cn('mt-0.5 shrink-0', CALLOUT_ICON_COLOR[tone])} />
      <div className="min-w-0 flex-1 leading-6">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className="text-[var(--text-muted)]">{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/** Marks data that comes from the demo catalog until its API is connected. */
export function DemoDataBadge({ show = true, className }) {
  const { t } = useTranslation()
  if (!show) return null
  return (
    <span title={t('campaignWizard.common.demoDataHint')} className={cn('inline-flex items-center gap-1 rounded-full border border-dashed border-[var(--notification-warning)] px-2 py-0.5 text-[10px] font-semibold text-[var(--notification-warning)]', className)}>
      <FlaskConical size={11} />
      {t('campaignWizard.common.demoData')}
    </span>
  )
}

/** A titled block inside a step. `id` makes it a jump target for issues. */
export function SectionCard({ icon: Icon, title, description, badge, actions, children, fieldPath, className }) {
  return (
    <section data-wizard-field={fieldPath} className={cn('rounded-lg border border-[var(--border)] bg-[var(--surface)]', className)}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--brand-accent)]"><Icon size={16} /></span>}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--text)]">{title}</h3>
              {badge}
            </div>
            {description && <p className="mt-0.5 text-xs leading-5 text-[var(--text-muted)]">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
      <div className="grid gap-4 p-4">{children}</div>
    </section>
  )
}

export function StatusDot({ status }) {
  const color = status === 'error' ? 'bg-[var(--notification-danger)]' : status === 'warning' ? 'bg-[var(--notification-warning)]' : status === 'complete' ? 'bg-[var(--notification-success)]' : 'bg-[var(--border)]'
  return <span className={cn('inline-block h-2 w-2 shrink-0 rounded-full', color)} aria-hidden="true" />
}
