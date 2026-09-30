import { useTranslation } from 'react-i18next'
import { useLocalStorage } from '../data-table/hooks/useLocalStorage'
import { cn } from '../../utils/cn'
import { DEFAULT_REPORT_RANGE, REPORT_RANGES } from './reportUtils'

/** Remembered range per report page (`storageKey` like 'reports:leads-center'). */
export function useReportRange(storageKey, fallback = DEFAULT_REPORT_RANGE) {
  const [stored, setStored] = useLocalStorage(storageKey, fallback)
  const range = REPORT_RANGES.includes(stored) ? stored : fallback
  return [range, setStored]
}

/**
 * Date-range presets. Sits in one row above every chart it scopes (never inside a chart card).
 * `ranges` narrows the presets when a data source cannot support all of them.
 */
export function ReportRangeFilter({ value, onChange, ranges = REPORT_RANGES }) {
  const { t } = useTranslation()

  return (
    <div role="radiogroup" aria-label={t('reports.range.label')} className="inline-flex flex-wrap rounded-lg bg-[var(--surface-2)] p-1">
      {ranges.map((range) => (
        <button
          key={range}
          type="button"
          role="radio"
          aria-checked={value === range}
          onClick={() => onChange(range)}
          className={cn(
            'h-8 rounded-md px-3 text-xs font-bold transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]',
            value === range ? 'bg-[var(--surface)] text-[var(--brand-accent)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
          )}
        >
          {t(`reports.range.${range}`)}
        </button>
      ))}
    </div>
  )
}
