import { useTranslation } from 'react-i18next'
import { Badge } from '../../../../../shared/components/ui/Badge'
import { userLabel } from '../../utils/teamModel'
import { useConditionLabels } from '../../hooks/useRuleConditionOptions'
import { formConditions, targetPreview } from '../utils/ruleBuilder'
import { ASSIGN_TYPE_ICONS } from '../../components/AssignTypePicker'

/** The rule in words: "Leads from [source] [campaign] → [assign type] → [team / user]". */
export function RuleSentence({ form, context }) {
  const { t } = useTranslation()
  const labels = useConditionLabels(form)
  const conditions = formConditions(form)
  const preview = targetPreview(form, context)
  const Icon = ASSIGN_TYPE_ICONS[form.assign_type]
  const targetName = preview.kind === 'user'
    ? (preview.user ? userLabel(preview.user) : '')
    : (preview.team?.name || '')

  const valueOf = (key, value) => (key === 'source'
    ? t(`salesTeams.sources.${value}`, { defaultValue: value })
    : labels[key]?.get(value) || `#${value}`)

  return (
    <div className="grid gap-2 text-sm">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[var(--text-muted)]">{t('salesTeams.builder.sentence.when')}</span>
        {conditions.length ? conditions.map(({ key, value }) => (
          <Badge key={key}>
            <span className="text-[var(--text-muted)]">{t(`salesTeams.conditions.${key}`)}:</span>
            <span className="ms-1 font-semibold">{valueOf(key, value)}</span>
          </Badge>
        )) : <Badge variant="purple">{t('salesTeams.rules.allLeads')}</Badge>}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[var(--text-muted)]">{t('salesTeams.builder.sentence.then')}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-accent-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--brand-accent)]">
          {Icon && <Icon size={13} aria-hidden="true" />}
          {t(`salesTeams.assignTypes.${form.assign_type}.label`)}
        </span>
        <span className={targetName ? 'font-semibold text-[var(--text)]' : 'text-[var(--text-light)]'}>
          {targetName || t(preview.kind === 'user' ? 'salesTeams.builder.sentence.noUser' : 'salesTeams.builder.sentence.noTeam')}
        </span>
      </div>
    </div>
  )
}
