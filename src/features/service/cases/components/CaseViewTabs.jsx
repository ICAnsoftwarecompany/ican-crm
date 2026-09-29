import { useTranslation } from 'react-i18next'
import { cn } from '../../../../shared/utils/cn'
import { CASE_VIEWS } from '../constants/caseViews'

/** Built-in view tabs with live counts from `useCaseSummary()`. */
export function CaseViewTabs({ view, onChange, counts = {} }) {
  const { t } = useTranslation()
  return (
    <div role="tablist" aria-label={t('service.cases.views.label')} className="flex gap-1 overflow-x-auto border-b border-[var(--border)]">
      {CASE_VIEWS.map((key) => {
        const active = key === view
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(key)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent',
              active
                ? 'border-brand-accent font-semibold text-[var(--text)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
            )}
          >
            {t(`service.cases.views.${key}`)}
            {counts[key] != null && (
              <span className="rounded-full bg-[var(--surface-2)] px-1.5 text-xs text-[var(--text-muted)]" dir="ltr">
                {counts[key]}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
