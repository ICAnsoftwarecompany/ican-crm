import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ConfirmDialog } from '../../../../shared/components/overlays/ConfirmDialog'
import { useAiDuplicates, useAiMutations } from '../api/aiApi'

/** Open cases that look like the same issue; the agent may close this one as a duplicate (linked both ways). */
export function AiDuplicates({ caseItem, enabled }) {
  const { t } = useTranslation()
  const query = useAiDuplicates(caseItem.id, enabled)
  const { markDuplicate, feedback } = useAiMutations()
  const [target, setTarget] = useState(null)
  const items = query.data || []
  if (!enabled || !items.length) return null
  return (
    <div className="grid gap-2">
      <h3 className="text-xs font-semibold text-[var(--text)]">{t('service.ai.duplicates.title')}</h3>
      <ul className="grid gap-1.5">
        {items.map((entry) => (
          <li key={entry.case.id} className="grid gap-0.5 rounded-md border border-[var(--border)] p-2 text-sm">
            <Link to={`/service/cases/${entry.case.id}`} className="font-medium text-[var(--text)] hover:underline"><span dir="ltr" className="font-mono text-xs text-[var(--text-muted)]">{entry.case.case_number}</span> <bdi>{entry.case.subject}</bdi></Link>
            <span className="text-xs text-[var(--text-muted)]">{[t('service.ai.match', { value: Math.round(entry.score * 100) }), ...entry.reasons.map((reason) => t(`service.ai.duplicates.reasons.${reason}`))].join(' · ')}</span>
            <button type="button" className="w-fit text-xs font-medium text-brand-accent hover:underline" onClick={() => setTarget(entry.case)}>{t('service.ai.duplicates.mark')}</button>
          </li>
        ))}
      </ul>
      <ConfirmDialog
        isOpen={Boolean(target)}
        title={t('service.ai.duplicates.confirmTitle')}
        message={target && t('service.ai.duplicates.confirmMessage', { number: target.case_number })}
        confirmText={t('service.ai.duplicates.mark')}
        loading={markDuplicate.isPending}
        onCancel={() => setTarget(null)}
        onConfirm={() => markDuplicate.mutate({ caseId: caseItem.id, of_case_id: target.id, version: caseItem.version }, {
          onSuccess: () => {
            feedback.mutate({ caseId: caseItem.id, feature: 'duplicates', accepted: true })
            toast.success(t('service.ai.duplicates.done', { number: target.case_number }))
            setTarget(null)
          },
          onError: () => setTarget(null),
        })}
      />
    </div>
  )
}
