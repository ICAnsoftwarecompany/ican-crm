import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Badge } from '../../../../../shared/components/ui/Badge'
import { normalizeRule, ruleWarnings } from '../../utils/ruleModel'
import { RuleSentence } from './RuleSentence'

/** Live summary on the side: name, priority, active and the rule sentence, updated on every change. */
export function RuleSummaryCard({ form, context }) {
  const { t } = useTranslation()
  const draft = normalizeRule(form)
  const warnings = (form.team_id || form.user_id) ? ruleWarnings(draft, context) : []

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4" aria-labelledby="rule-summary-title">
      <h3 id="rule-summary-title" className="text-sm font-bold text-[var(--text)]">{t('salesTeams.builder.summaryTitle')}</h3>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="min-w-0 break-words text-sm font-semibold text-[var(--text)]">{form.name.trim() || t('salesTeams.builder.unnamed')}</span>
        <Badge>{t('salesTeams.rules.priority')}: {String(form.priority).trim() || '—'}</Badge>
        <Badge variant={form.active ? 'success' : 'danger'}>{t(form.active ? 'salesTeams.common.active' : 'salesTeams.common.inactive')}</Badge>
      </div>
      <div className="mt-3 border-t border-[var(--border)] pt-3">
        <RuleSentence form={form} context={context} />
      </div>
      {warnings.length > 0 && (
        <ul className="mt-3 grid gap-1">
          {warnings.map((warning) => (
            <li key={warning} className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
              <AlertTriangle size={13} className="shrink-0" aria-hidden="true" />
              {t(`salesTeams.warnings.${warning}`)}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
