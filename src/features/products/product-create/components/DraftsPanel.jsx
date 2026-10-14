import { useTranslation } from 'react-i18next'
import { FileClock, Trash2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { formatDate } from '../../../../shared/utils/dateTime'

/** Saved drafts of this wizard (2026-10-15), each with "continue" and "delete". Hidden when there are none. */
export function DraftsPanel({ drafts = [], onOpen, onRemove }) {
  const { t } = useTranslation()
  if (!drafts.length) return null
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3" aria-labelledby="product-drafts-title">
      <h2 id="product-drafts-title" className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
        <FileClock size={16} aria-hidden="true" />
        {t('productSetup.drafts.title', { count: drafts.length })}
      </h2>
      <ul className="divide-y divide-[var(--border)]">
        {drafts.map((draft) => (
          <li key={draft.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
            <span className="min-w-0 text-sm">
              <span className="block truncate font-medium text-[var(--text)]">{draft.form?.name || t('productSetup.drafts.untitled')}</span>
              <span className="block text-xs text-[var(--text-muted)]">
                {t('productSetup.drafts.meta', { step: t(`catalog.create.steps.${draft.step}.title`), date: formatDate(draft.updatedAt) })}
              </span>
            </span>
            <span className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => onOpen(draft)}>{t('productSetup.drafts.continue')}</Button>
              <Button size="icon" variant="ghost" onClick={() => onRemove(draft.id)} aria-label={t('productSetup.drafts.remove')}><Trash2 size={15} /></Button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
