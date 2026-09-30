import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Star } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { cn } from '../../../../shared/utils/cn'
import { portalEndpoints as P } from '../../../service/portal-transport'
import { portalApi, usePortalList, usePortalMutation } from '../../api/portalApi'
import { usePortalFormat } from '../../utils/format'
import { usePortalAccess } from '../../hooks/usePortalAccess'
import { Card, PortalPage } from '../PortalPage'
import { KbBrowser } from './KbBrowser'

const TEXTAREA = 'min-h-[80px] w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-brand-accent'

function FeedbackCard() {
  const { t } = useTranslation()
  const format = usePortalFormat()
  const active = usePortalList('active-survey', P.activeSurvey)
  const survey = active.data && !Array.isArray(active.data) ? active.data : null
  const [score, setScore] = useState(null)
  const [comment, setComment] = useState('')
  const send = usePortalMutation(() => portalApi.post(P.feedback, { score, comment: comment || undefined, survey_id: survey?.id }), { onSuccess: () => { toast.success(t('portal.help.thanks')); setScore(null); setComment('') } })
  const [min, max] = survey?.scale || [1, 5]
  const steps = Array.from({ length: max - min + 1 }, (_, index) => min + index)
  return (
    <Card className="grid gap-3">
      <h2 className="font-semibold">{survey ? format.label(survey.question, '') : t('portal.help.feedbackTitle')}</h2>
      {survey ? (
        <div className="grid gap-1">
          <div className="flex flex-wrap gap-1" role="radiogroup" aria-label={t('portal.help.rating')}>
            {steps.map((value) => (
              <button key={value} type="button" role="radio" aria-checked={score === value} onClick={() => setScore(value)} className={cn('h-9 w-9 rounded-lg border text-sm', score === value ? 'border-brand-accent bg-brand-accent font-semibold text-white' : 'border-[var(--border)] hover:bg-[var(--surface-2)]')}>{value}</button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-[var(--text-muted)]"><span>{t(`portal.help.scale.${survey.type}.low`)}</span><span>{t(`portal.help.scale.${survey.type}.high`)}</span></div>
        </div>
      ) : (
        <div className="flex gap-1" role="radiogroup" aria-label={t('portal.help.rating')}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" role="radio" aria-checked={score === value} aria-label={t('portal.help.stars', { count: value })} onClick={() => setScore(value)} className="p-1">
              <Star size={24} aria-hidden="true" className={cn(value <= (score || 0) ? 'fill-sla-at-risk text-sla-at-risk' : 'text-[var(--text-muted)]')} />
            </button>
          ))}
        </div>
      )}
      <textarea dir="auto" aria-label={t('portal.help.comment')} placeholder={t('portal.help.comment')} className={TEXTAREA} value={comment} onChange={(event) => setComment(event.target.value)} />
      <Button className="w-fit" disabled={score === null} loading={send.isPending} onClick={() => send.mutate()}>{t('portal.help.send')}</Button>
    </Card>
  )
}

const SIGNED_IN = { list: P.kb, article: P.kbArticle, vote: P.kbVote }

/** Help center (customer-visible, published KB) + feedback. */
export function PortalHelp() {
  const { t } = useTranslation()
  const { can } = usePortalAccess()
  return (
    <PortalPage title={t('portal.sections.kb')} description={t('portal.help.description')}>
      {can('kb') && <KbBrowser endpoints={SIGNED_IN} scope="member" />}
      {can('feedback', 'create') && <FeedbackCard />}
    </PortalPage>
  )
}
