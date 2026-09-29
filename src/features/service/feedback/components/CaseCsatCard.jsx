import { useTranslation } from 'react-i18next'
import { formatRelativeTime } from '../../../../shared/utils/dateTime'
import { CsatScore } from './CsatScore'

/** Customer rating on a resolved case (`case.csat`); hidden until the customer answers. */
export function CaseCsatCard({ csat }) {
  const { t, i18n } = useTranslation()
  if (!csat) return null
  return (
    <section className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <header className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--text)]">{t('service.feedback.caseTitle')}</h2>
        <CsatScore score={csat.score} />
      </header>
      {csat.comment && <p dir="auto" className="rounded-md bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)]">{csat.comment}</p>}
      <p className="text-xs text-[var(--text-muted)]">{formatRelativeTime(csat.responded_at, i18n.language)}</p>
    </section>
  )
}
