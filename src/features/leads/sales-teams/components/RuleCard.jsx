import { useTranslation } from 'react-i18next'
import { AlertTriangle, ArrowLeft, Pencil } from 'lucide-react'
import { Badge } from '../../../../shared/components/ui/Badge'
import { Button } from '../../../../shared/components/ui/Button'
import { cn } from '../../../../shared/utils/cn'
import { userLabel } from '../utils/teamModel'
import { ruleConditions, ruleWarnings, targetOf } from '../utils/ruleModel'
import { ASSIGN_TYPE_ICONS } from './AssignTypePicker'

function conditionValue(t, rule, key, value, labels) {
  if (key === 'source') return t(`salesTeams.sources.${value}`, { defaultValue: value })
  const name = { campaign_id: rule.names.campaign, ad_id: rule.names.ad, form_id: rule.names.form }[key]
  return name || labels?.[key]?.get(value) || `#${value}`
}

/** One rule as "conditions → assign type → target", with priority, warnings, active switch and edit. */
export function RuleCard({ rule, teamById, userById, conditionLabels, toggling, onToggle, onEdit }) {
  const { t } = useTranslation()
  const conditions = ruleConditions(rule)
  const warnings = ruleWarnings(rule, { teamById, userById })
  const Icon = ASSIGN_TYPE_ICONS[rule.assign_type]
  const isUser = targetOf(rule.assign_type) === 'user'
  const team = teamById.get(rule.team_id)
  const user = userById.get(rule.user_id)
  const targetName = isUser
    ? (user ? userLabel(user) : rule.names.user || (rule.user_id ? `#${rule.user_id}` : '—'))
    : (team?.name || rule.names.team || (rule.team_id ? `#${rule.team_id}` : '—'))

  return (
    <article className={cn('rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4', !rule.active && 'opacity-70')}>
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md bg-[var(--surface-2)] px-1.5 text-xs font-bold text-[var(--text)]" title={t('salesTeams.rules.priority')}>
            {rule.priority}
          </span>
          <h3 className="min-w-0 break-words text-sm font-bold text-[var(--text)]">{rule.name || t('salesTeams.rules.fallbackName', { id: rule.id })}</h3>
        </div>
        <div className="flex items-center gap-1">
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
            <input
              type="checkbox"
              role="switch"
              className="h-4 w-4 accent-[var(--brand-accent)]"
              checked={rule.active}
              disabled={toggling}
              onChange={onToggle}
              aria-label={t(rule.active ? 'salesTeams.rules.deactivate' : 'salesTeams.rules.activate')}
            />
            {t(rule.active ? 'salesTeams.common.active' : 'salesTeams.common.inactive')}
          </label>
          <Button variant="ghost" size="icon" onClick={onEdit} aria-label={t('salesTeams.rules.edit')} title={t('salesTeams.rules.edit')}>
            <Pencil size={15} />
          </Button>
        </div>
      </header>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {conditions.length ? conditions.map(({ key, value }) => (
            <Badge key={key}>
              <span className="text-[var(--text-muted)]">{t(`salesTeams.conditions.${key}`)}:</span>
              <span className="ms-1 font-semibold">{conditionValue(t, rule, key, value, conditionLabels)}</span>
            </Badge>
          )) : <Badge variant="purple">{t('salesTeams.rules.allLeads')}</Badge>}
        </div>
        <ArrowLeft size={16} className="shrink-0 text-[var(--text-light)] ltr:rotate-180" aria-hidden="true" />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-accent-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--brand-accent)]">
          {Icon && <Icon size={13} aria-hidden="true" />}
          {t(`salesTeams.assignTypes.${rule.assign_type}.label`)}
        </span>
        <span className="min-w-0 truncate font-semibold text-[var(--text)]">{targetName}</span>
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
    </article>
  )
}
