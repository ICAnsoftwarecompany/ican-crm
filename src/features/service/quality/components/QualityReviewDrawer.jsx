import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { Button } from '../../../../shared/components/ui/Button'
import { Select } from '../../../../shared/components/ui/Select'
import { cn } from '../../../../shared/utils/cn'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { TEXTAREA_CLASS } from '../../settings/components/fields/ResourceField'
import { useQualityMutations } from '../api/qualityApi'
import { ROOT_CAUSES, SCORE_STEPS, previewScore } from '../constants/quality'

/** Score one review against its checklist (0–5 per criterion, weighted). Failing reviews need RCA + corrective action. */
export function QualityReviewDrawer({ review, onClose }) {
  const { t, i18n } = useTranslation()
  const { submit } = useQualityMutations()
  const [form, setForm] = useState({ scores: {}, comments: '', root_cause: '', corrective_action: '', preventive_action: '' })
  const errors = getServiceFieldErrors(submit.error)
  useEffect(() => {
    if (review) {
      setForm({ scores: review.scores || {}, comments: review.comments || '', root_cause: review.root_cause || '', corrective_action: review.corrective_action || '', preventive_action: review.preventive_action || '' })
      submit.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [review?.id])
  const readOnly = review?.status === 'done'
  const criteria = review?.checklist?.criteria || []
  const complete = criteria.every((criterion) => form.scores[criterion.key] !== undefined)
  const total = previewScore(criteria, form.scores)
  const failing = complete && total < (review?.checklist?.pass_score ?? 0)
  const set = (name) => (value) => setForm((current) => ({ ...current, [name]: value }))
  const save = () =>
    submit.mutate({ id: review.id, ...form, root_cause: form.root_cause || null }, {
      onSuccess: (saved) => {
        toast.success(t(saved.passed ? 'service.quality.done.passed' : 'service.quality.done.failed', { score: saved.total }))
        onClose()
      },
    })

  return (
    <AppDrawer open={Boolean(review)} onClose={onClose} size="md" title={t('service.quality.review')} description={review && localizeLabel(review.checklist?.name, i18n.language, '')} drawerKey="service-quality-review">
      {review && (
        <div className="grid gap-4 p-4">
          <div className="grid gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm">
            <Link to={`/service/cases/${review.subject.id}`} className="font-medium text-[var(--text)] hover:underline"><span dir="ltr" className="font-mono text-xs text-[var(--text-muted)]">{review.subject.number}</span> <bdi>{review.subject.title}</bdi></Link>
            <span className="text-xs text-[var(--text-muted)]">{t('service.quality.agentLine', { name: review.agent?.name })}</span>
          </div>
          <ul className="grid gap-3">
            {criteria.map((criterion) => (
              <li key={criterion.key} className="grid gap-1.5">
                <span className="flex items-center justify-between text-sm text-[var(--text)]">
                  <span>{localizeLabel(criterion.label, i18n.language, criterion.key)}</span>
                  <span className="text-xs text-[var(--text-muted)]">{t('service.quality.weight', { value: criterion.weight })}</span>
                </span>
                <div className="flex gap-1" role="radiogroup" aria-label={localizeLabel(criterion.label, i18n.language, criterion.key)}>
                  {SCORE_STEPS.map((step) => (
                    <button key={step} type="button" role="radio" aria-checked={form.scores[criterion.key] === step} disabled={readOnly} onClick={() => set('scores')({ ...form.scores, [criterion.key]: step })}
                      className={cn('h-8 w-9 rounded-md border text-sm transition-colors disabled:cursor-default', form.scores[criterion.key] === step ? 'border-brand-accent bg-[var(--surface-2)] font-semibold text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]')}>
                      {step}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
          {errors.scores && <p className="text-xs text-status-lost">{t('service.quality.validation.allScores')}</p>}
          <p className={cn('text-sm font-semibold', !complete ? 'text-[var(--text-muted)]' : failing ? 'text-sla-breached' : 'text-sla-on-track')}>
            {complete ? t('service.quality.totalLine', { score: total, pass: review.checklist?.pass_score }) : t('service.quality.scoreAll')}
          </p>
          <label className="grid gap-1 text-sm font-medium text-[var(--text)]">
            {t('service.quality.fields.comments')}
            <textarea dir="auto" disabled={readOnly} className={TEXTAREA_CLASS} value={form.comments} onChange={(event) => set('comments')(event.target.value)} />
          </label>
          {(failing || form.root_cause) && (
            <div className="grid gap-3 rounded-lg border border-sla-at-risk p-3">
              <p className="text-xs text-[var(--text-muted)]">{t('service.quality.capaHint')}</p>
              <Select label={t('service.quality.fields.rootCause')} disabled={readOnly} value={form.root_cause} onChange={set('root_cause')} options={ROOT_CAUSES.map((value) => ({ value, label: t(`service.quality.rootCauses.${value}`) }))} error={errors.root_cause && t('service.settings.validation.required')} />
              <label className="grid gap-1 text-sm font-medium text-[var(--text)]">
                {t('service.quality.fields.corrective')}
                <textarea dir="auto" disabled={readOnly} className={TEXTAREA_CLASS} value={form.corrective_action} onChange={(event) => set('corrective_action')(event.target.value)} />
                {errors.corrective_action && <span className="text-xs font-normal text-status-lost">{t('service.settings.validation.required')}</span>}
              </label>
              <label className="grid gap-1 text-sm font-medium text-[var(--text)]">
                {t('service.quality.fields.preventive')}
                <textarea dir="auto" disabled={readOnly} className={TEXTAREA_CLASS} value={form.preventive_action} onChange={(event) => set('preventive_action')(event.target.value)} />
              </label>
            </div>
          )}
          {!readOnly && <Button className="w-fit" disabled={!complete} loading={submit.isPending} onClick={save}>{t('service.quality.submit')}</Button>}
        </div>
      )}
    </AppDrawer>
  )
}
