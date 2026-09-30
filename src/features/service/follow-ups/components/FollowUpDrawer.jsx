import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Check, LogOut } from 'lucide-react'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { Button } from '../../../../shared/components/ui/Button'
import { Select } from '../../../../shared/components/ui/Select'
import { formatDate, formatRelativeTime } from '../../../../shared/utils/dateTime'
import { cn } from '../../../../shared/utils/cn'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { EXIT_REASONS } from '../constants/followUps'
import { useFollowUpMutations } from '../api/followUpsApi'
import { outcomeLabel } from './followUpLabels'
import { FollowUpHistory } from './FollowUpHistory'

const TEXTAREA = 'min-h-20 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-brand-accent'

/** One enrollment: the current step (task, checklist, outcome buttons), what each outcome does, history, exit. */
export function FollowUpDrawer({ enrollment, onChange, onClose }) {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const { outcome, exit } = useFollowUpMutations()
  const [note, setNote] = useState('')
  const [checked, setChecked] = useState([])
  const [exitReason, setExitReason] = useState('')
  useEffect(() => {
    setNote('')
    setChecked([])
    setExitReason('')
  }, [enrollment?.id, enrollment?.current_step, enrollment?.attempts])

  const step = enrollment?.step
  const active = enrollment?.status === 'active'
  const record = (key) =>
    outcome.mutate({ id: enrollment.id, outcome: key, note: note || undefined, checklist: checked }, {
      onSuccess: (result) => {
        const created = result.history?.at(-1)?.case
        toast.success(created ? t('service.followUps.done.caseOpened', { number: created.case_number }) : t(`service.followUps.done.${result.effect}`))
        onChange(result)
      },
    })
  const leave = () => exit.mutate({ id: enrollment.id, reason: exitReason }, { onSuccess: (result) => { toast.success(t('service.followUps.done.exited')); onChange(result) } })

  return (
    <AppDrawer open={Boolean(enrollment)} onClose={onClose} size="md" title={enrollment?.customer?.name} description={localizeLabel(enrollment?.program?.name, language, '')} drawerKey="service-follow-up">
      {enrollment && (
        <div className="grid gap-5 p-4">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="grid"><dt className="text-xs text-[var(--text-muted)]">{t('service.followUps.columns.owner')}</dt><dd className="text-[var(--text)]">{enrollment.owner?.name || '—'}</dd></div>
            <div className="grid"><dt className="text-xs text-[var(--text-muted)]">{t('service.followUps.fields.status')}</dt><dd className="text-[var(--text)]">{t(`service.followUps.statuses.${enrollment.status}`)}</dd></div>
            <div className="grid"><dt className="text-xs text-[var(--text-muted)]">{t('service.followUps.fields.phone')}</dt><dd><span dir="ltr" className="text-[var(--text)]">{enrollment.customer?.phone}</span></dd></div>
            <div className="grid"><dt className="text-xs text-[var(--text-muted)]">{t('service.followUps.fields.version')}</dt><dd className="text-[var(--text)]">{t('service.followUps.versionN', { n: enrollment.program_version })}</dd></div>
          </dl>

          {active && step && (
            <section className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3" aria-label={t('service.followUps.currentStep')}>
              <div className="flex items-start justify-between gap-2">
                <span className="grid">
                  <span className="text-xs text-[var(--text-muted)]">{t('service.followUps.stepOf', { n: enrollment.step_number, total: enrollment.steps_total })} · {t(`service.followUps.channels.${step.channel}`)}</span>
                  <span className="font-semibold text-[var(--text)]">{localizeLabel(step.task_title, language, step.key)}</span>
                </span>
                {enrollment.next_due_at && <span className={cn('shrink-0 text-xs font-medium', enrollment.bucket === 'overdue' ? 'text-sla-breached' : enrollment.bucket === 'due_today' ? 'text-sla-at-risk' : 'text-[var(--text-muted)]')} title={formatDate(enrollment.next_due_at, language)}>{formatRelativeTime(enrollment.next_due_at, language)}</span>}
              </div>
              {enrollment.attempts > 0 && <p className="text-xs text-sla-at-risk">{t('service.followUps.retryNote', { n: enrollment.attempts })}</p>}
              {step.checklist?.length > 0 && (
                <fieldset className="grid gap-1.5">
                  <legend className="mb-1 text-xs font-medium text-[var(--text-muted)]">{t('service.followUps.fields.checklist')}</legend>
                  {step.checklist.map((item, index) => {
                    const text = localizeLabel(item, language, '')
                    return (
                      <label key={index} className="inline-flex items-center gap-2 text-sm text-[var(--text)]">
                        <input type="checkbox" checked={checked.includes(text)} onChange={(event) => setChecked((current) => (event.target.checked ? [...current, text] : current.filter((entry) => entry !== text)))} />
                        {text}
                      </label>
                    )
                  })}
                </fieldset>
              )}
              <label className="grid gap-1 text-xs font-medium text-[var(--text-muted)]">
                {t('service.followUps.fields.note')}
                <textarea className={TEXTAREA} value={note} onChange={(event) => setNote(event.target.value)} />
              </label>
              <div className="grid gap-2">
                <span className="text-xs font-medium text-[var(--text-muted)]">{t('service.followUps.recordOutcome')}</span>
                <div className="flex flex-wrap gap-2">
                  {step.outcomes.map((key) => {
                    const rule = step.on_outcome?.[key]
                    return (
                      <Button key={key} size="sm" variant="outline" disabled={outcome.isPending} onClick={() => record(key)} title={rule ? t(`service.followUps.ruleHints.${rule.split(':')[0]}`) : t('service.followUps.ruleHints.next')}>
                        <Check size={14} aria-hidden="true" />
                        {outcomeLabel(t, key)}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </section>
          )}

          <FollowUpHistory enrollment={enrollment} />

          {active && (
            <section className="grid gap-2 border-t border-[var(--border)] pt-4" aria-label={t('service.followUps.exit')}>
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <Select label={t('service.followUps.exitReason')} value={exitReason} onChange={setExitReason} options={EXIT_REASONS.map((value) => ({ value, label: t(`service.followUps.exitReasons.${value}`) }))} />
                <Button variant="outline" disabled={!exitReason || exit.isPending} onClick={leave}><LogOut size={14} aria-hidden="true" />{t('service.followUps.exit')}</Button>
              </div>
            </section>
          )}
        </div>
      )}
    </AppDrawer>
  )
}
