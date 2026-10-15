import { useTranslation } from 'react-i18next'
import { cn } from '../../../../shared/utils/cn'
import { completenessTone } from '../../utils/dealCompleteness'

const TONES = {
  low: { bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
  mid: { bar: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300' },
  full: { bar: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' },
}

/** Deal setup completeness (utils/dealCompleteness): "78%" + a colored bar (+ "7 of 9" when not compact). */
export function CompletenessMeter({ completeness, compact = false }) {
  const { t } = useTranslation()
  if (!completeness) return '—'
  const tone = TONES[completenessTone(completeness.score)]
  return (
    <div className={cn('min-w-[96px]', compact ? '' : 'space-y-1')} title={t('dealWorkspace.completeness.of', { done: completeness.done, total: completeness.total })}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className={cn('font-bold tabular-nums', tone.text)} dir="ltr">{completeness.score}%</span>
        {!compact && <span className="text-[var(--text-muted)]">{t('dealWorkspace.completeness.of', { done: completeness.done, total: completeness.total })}</span>}
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completeness.score} aria-label={t('dealWorkspace.completeness.label')}>
        <div className={cn('h-full rounded-full', tone.bar)} style={{ width: `${completeness.score}%` }} />
      </div>
    </div>
  )
}
