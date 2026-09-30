import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MessageSquareHeart } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Select } from '../../../../shared/components/ui/Select'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { formatRelativeTime } from '../../../../shared/utils/dateTime'
import { useFeedbackResponses } from '../api/feedbackApi'
import { CsatScore } from './CsatScore'
import { SurveySummary } from './SurveySummary'
import { cn } from '../../../../shared/utils/cn'

const SURVEYS = ['csat', 'nps', 'ces']
const MAX = { nps: 10, ces: 7 }

const PER_PAGE = 20

/** Survey answers for the period (CSAT with a score filter, NPS, CES), newest first. */
export function FeedbackList({ period, caseBasePath = '/service/cases' }) {
  const { t, i18n } = useTranslation()
  const [score, setScore] = useState('')
  const [page, setPage] = useState(1)
  const [survey, setSurvey] = useState('csat')
  const query = useFeedbackResponses({ period, survey, score: survey === 'csat' ? score || undefined : undefined, page, per_page: PER_PAGE })
  const items = query.data?.data || []
  const meta = query.data?.meta
  const summary = meta?.summary

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('service.feedback.surveyType')}>
        {SURVEYS.map((key) => (
          <button key={key} type="button" role="tab" aria-selected={survey === key} onClick={() => { setSurvey(key); setPage(1) }} className={cn('rounded-full border px-3 py-1 text-xs', survey === key ? 'border-brand-accent font-semibold text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]')}>
            {t(`service.feedback.types.${key}`)}
          </button>
        ))}
      </div>
      {survey !== 'csat' && <SurveySummary type={survey} summary={summary} />}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-[var(--text-muted)]">
          {survey === 'csat' && summary?.count ? t('service.feedback.summary', { count: summary.count, average: summary.average, percent: summary.satisfied_percent }) : null}
        </p>
        {survey === 'csat' && <div className="w-44">
          <Select
            aria-label={t('service.feedback.filterScore')}
            placeholder={t('service.feedback.allScores')}
            value={score}
            onChange={(next) => {
              setScore(next)
              setPage(1)
            }}
            options={[5, 4, 3, 2, 1].map((value) => ({ value: String(value), label: t('service.reports.stars', { count: value }) }))}
          />
        </div>}
      </div>
      <ResourceState
        isLoading={query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        empty={!items.length}
        emptyIcon={<MessageSquareHeart size={24} />}
        emptyTitle={t('service.feedback.emptyTitle')}
        emptyDescription={t('service.feedback.emptyDescription')}
      >
        <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          {items.map((entry) => (
            <li key={entry.id} className="grid gap-1 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                {survey === 'csat' ? <CsatScore score={entry.score} /> : <span className="text-xs font-semibold text-[var(--text)]" dir="ltr">{entry.score}/{MAX[survey]}</span>}
                {entry.case && (
                  <Link to={`${caseBasePath}/${entry.case.id}`} className="font-mono hover:underline" dir="ltr">
                    {entry.case.case_number}
                  </Link>
                )}
                <span>{entry.case?.customer?.name || entry.customer?.name}</span>
                <span className="ms-auto">{formatRelativeTime(entry.responded_at, i18n.language)}</span>
              </div>
              {entry.case?.subject && <p className="text-sm text-[var(--text)]">{entry.case.subject}</p>}
              {entry.comment && <p dir="auto" className="rounded-md bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)]">{entry.comment}</p>}
            </li>
          ))}
        </ul>
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>{t('service.feedback.previous')}</Button>
            <span className="text-xs text-[var(--text-muted)]" dir="ltr">{meta.current_page} / {meta.last_page}</span>
            <Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => setPage(page + 1)}>{t('service.feedback.next')}</Button>
          </div>
        )}
      </ResourceState>
    </div>
  )
}
