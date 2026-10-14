import { useTranslation } from 'react-i18next'
import { cn } from '../../../../shared/utils/cn'

const BAR = { complete: 'bg-emerald-500', good: 'bg-amber-500', low: 'bg-red-500' }
const TEXT = { complete: 'text-emerald-700 dark:text-emerald-300', good: 'text-amber-700 dark:text-amber-300', low: 'text-red-700 dark:text-red-300' }

/** Completeness bar + percent (2026-10-15). `compact` (table cell) also lists what is missing under the bar. */
export function CompletenessMeter({ completeness, compact = false }) {
  const { t } = useTranslation()
  const { score, level, missing } = completeness
  const missingText = missing.map((key) => t(`productDetails.checks.${key}`)).join(' · ')
  return (
    <div className="min-w-0" title={missing.length ? t('productDetails.completeness.missing', { items: missingText }) : undefined}>
      <div className="flex items-center gap-2">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]"
          role="meter"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('productDetails.completeness.label')}
        >
          <div className={cn('h-full rounded-full', BAR[level])} style={{ width: `${score}%` }} />
        </div>
        <span className={cn('shrink-0 text-xs font-semibold tabular-nums', TEXT[level])} dir="ltr">{score}%</span>
      </div>
      {compact && missing.length > 0 && <p className="mt-1 truncate text-[11px] text-[var(--text-muted)]">{missingText}</p>}
    </div>
  )
}
