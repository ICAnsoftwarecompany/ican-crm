import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../../../../shared/utils/dateTime'
import { outcomeLabel } from './followUpLabels'

/** Recorded outcomes, newest first (with the case an outcome opened). */
export function FollowUpHistory({ enrollment }) {
  const { t, i18n } = useTranslation()
  const history = [...(enrollment.history || [])].reverse()
  return (
    <section className="grid gap-2" aria-label={t('service.followUps.history')}>
      <h3 className="text-sm font-semibold text-[var(--text)]">{t('service.followUps.history')}</h3>
      {!history.length && <p className="text-xs text-[var(--text-muted)]">{t('service.followUps.noHistory')}</p>}
      <ol className="grid gap-2">
        {history.map((entry, index) => (
          <li key={index} className="grid gap-0.5 border-s-2 border-[var(--border)] ps-3 text-sm">
            <span className="text-[var(--text)]"><span className="font-medium">{outcomeLabel(t, entry.outcome)}</span> · <span dir="ltr" className="font-mono text-xs text-[var(--text-muted)]">{entry.step_key}</span></span>
            <span className="text-xs text-[var(--text-muted)]">{[entry.by?.name, formatDate(entry.at, i18n.language)].filter(Boolean).join(' · ')}</span>
            {entry.note && <span className="text-xs text-[var(--text)]">{entry.note}</span>}
            {entry.checklist?.length > 0 && <span className="text-xs text-[var(--text-muted)]">{t('service.followUps.checkedCount', { count: entry.checklist.length })}</span>}
            {entry.case && <Link to={`/service/cases/${entry.case.id}`} className="w-fit text-xs font-medium text-brand-accent hover:underline"><span dir="ltr">{entry.case.case_number}</span></Link>}
          </li>
        ))}
      </ol>
      {enrollment.exit_reason && <p className="text-xs text-[var(--text-muted)]">{t('service.followUps.exitedBecause', { reason: t(`service.followUps.exitReasons.${enrollment.exit_reason}`, { defaultValue: enrollment.exit_reason }) })}</p>}
    </section>
  )
}
