import { useTranslation } from 'react-i18next'
import { CheckCircle2, ListTodo } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { CompletenessMeter } from './CompletenessMeter'

/**
 * "How complete is this item" (drawer and details page, 2026-10-15): the meter, what is missing, and a button to the
 * guided completion (`/products/:id/complete`). A complete item just shows a short confirmation.
 */
export function CompletenessCard({ completeness, onComplete }) {
  const { t } = useTranslation()
  if (completeness.level === 'complete') {
    return (
      <p className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)]">
        <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        {t('productDetails.completeness.complete')}
      </p>
    )
  }
  return (
    <section className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3" aria-labelledby="completeness-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="completeness-title" className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
          <ListTodo size={16} aria-hidden="true" />
          {t('productDetails.completeness.title', { done: completeness.done, total: completeness.total })}
        </h3>
        {onComplete && <Button size="sm" onClick={onComplete}>{t('productDetails.completeness.action')}</Button>}
      </div>
      <CompletenessMeter completeness={completeness} />
      <ul className="flex flex-wrap gap-1.5">
        {completeness.missing.map((key) => (
          <li key={key} className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-xs text-[var(--text)]">{t(`productDetails.checks.${key}`)}</li>
        ))}
      </ul>
    </section>
  )
}
