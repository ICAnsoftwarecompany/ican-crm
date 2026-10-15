import { useTranslation } from 'react-i18next'
import { Pencil } from 'lucide-react'
import { userLabel } from '../../../utils/teamModel'
import { targetOf } from '../../../utils/ruleModel'
import { useConditionLabels } from '../../../hooks/useRuleConditionOptions'
import { RuleSentence } from '../RuleSentence'

/** Step 6: everything in one place, each row with a link back to its step, then save. */
export function ReviewStep({ builder, context }) {
  const { t } = useTranslation()
  const { form, goTo } = builder
  const labels = useConditionLabels()
  const any = t('salesTeams.rules.anyValue')
  const isUser = targetOf(form.assign_type) === 'user'
  const team = context.teamById.get(form.team_id)
  const user = context.userById.get(form.user_id)
  const conditionValue = (key) => {
    if (!form[key]) return any
    if (key === 'source') return t(`salesTeams.sources.${form.source}`, { defaultValue: form.source })
    return labels[key]?.get(form[key]) || `#${form[key]}`
  }

  const rows = [
    { step: 'basics', label: t('salesTeams.rules.name'), value: form.name },
    ...['source', 'campaign_id', 'ad_id', 'form_id'].map((key) => ({ step: 'conditions', label: t(`salesTeams.conditions.${key}`), value: conditionValue(key) })),
    { step: 'method', label: t('salesTeams.rules.assignType'), value: t(`salesTeams.assignTypes.${form.assign_type}.label`) },
    isUser
      ? { step: 'target', label: t('salesTeams.rules.targetUser'), value: user ? userLabel(user) : `#${form.user_id}` }
      : { step: 'target', label: t('salesTeams.rules.targetTeam'), value: team?.name || `#${form.team_id}` },
    { step: 'priority', label: t('salesTeams.rules.priority'), value: form.priority },
    { step: 'priority', label: t('salesTeams.filters.status'), value: t(form.active ? 'salesTeams.common.active' : 'salesTeams.common.inactive') },
  ]

  return (
    <div className="grid gap-4">
      <div className="rounded-lg bg-[var(--surface-2)] p-3">
        <RuleSentence form={form} context={context} />
      </div>
      <dl className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
        {rows.map((row) => (
          <div key={`${row.step}-${row.label}`} className="flex items-center gap-3 px-3 py-2 text-sm">
            <dt className="w-32 shrink-0 text-[var(--text-muted)]">{row.label}</dt>
            <dd className="min-w-0 flex-1 break-words font-semibold text-[var(--text)]">{row.value}</dd>
            <button
              type="button"
              onClick={() => goTo(row.step)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-accent)] hover:underline"
              aria-label={t('salesTeams.builder.review.editField', { field: row.label })}
            >
              <Pencil size={12} aria-hidden="true" />
              {t('salesTeams.builder.review.edit')}
            </button>
          </div>
        ))}
      </dl>
      <p className="text-xs leading-5 text-[var(--text-muted)]">{t('salesTeams.builder.review.note')}</p>
    </div>
  )
}
