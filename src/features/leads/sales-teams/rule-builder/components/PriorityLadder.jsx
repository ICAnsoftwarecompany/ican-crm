import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp, ListOrdered } from 'lucide-react'
import { Badge } from '../../../../../shared/components/ui/Badge'
import { cn } from '../../../../../shared/utils/cn'
import { userLabel } from '../../utils/teamModel'
import { ruleConditions, targetOf } from '../../utils/ruleModel'
import { useConditionLabels } from '../../hooks/useRuleConditionOptions'
import { priorityAbove, priorityBelow, priorityLadder } from '../utils/ruleBuilder'

function RuleFacts({ rule, context, labels }) {
  const { t, i18n } = useTranslation()
  const arrow = i18n.dir() === 'rtl' ? '←' : '→'
  const conditions = ruleConditions(rule)
  const valueOf = (key, value) => (key === 'source'
    ? t(`salesTeams.sources.${value}`, { defaultValue: value })
    : labels[key]?.get(value) || `#${value}`)
  const target = targetOf(rule.assign_type) === 'user'
    ? userLabel(context.userById.get(rule.user_id)) || rule.names?.user
    : context.teamById.get(rule.team_id)?.name || rule.names?.team
  const what = conditions.length
    ? conditions.map(({ key, value }) => `${t(`salesTeams.conditions.${key}`)}: ${valueOf(key, value)}`).join(' · ')
    : t('salesTeams.rules.allLeads')

  return (
    <span className="block truncate text-xs text-[var(--text-muted)]">
      {what} {arrow} {t(`salesTeams.assignTypes.${rule.assign_type}.label`)}{target ? ` · ${target}` : ''}
    </span>
  )
}

/**
 * Every existing rule with its priority, highest first, and this rule placed live where its priority puts it.
 * "Above" / "Below" on a row set this rule's priority right above / below that rule.
 */
export function PriorityLadder({ form, context, onPick }) {
  const { t } = useTranslation()
  const labels = useConditionLabels(form)
  const { rows, position } = priorityLadder(context.rules, form, context.editingId)
  const others = rows.filter((row) => !row.isDraft)

  return (
    <section className="grid gap-2" aria-labelledby="priority-ladder-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id="priority-ladder-title" className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text)]">
          <ListOrdered size={16} className="text-[var(--brand-accent)]" aria-hidden="true" />
          {t('salesTeams.builder.ladder.title', { count: others.length })}
        </h3>
        {position >= 0 && (
          <span className="text-xs text-[var(--text-muted)]">{t('salesTeams.builder.ladder.position', { position: position + 1, total: rows.length })}</span>
        )}
      </div>
      <p className="text-xs leading-5 text-[var(--text-muted)]">{t('salesTeams.builder.ladder.hint')}</p>

      {others.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--border)] p-4 text-center text-sm text-[var(--text-muted)]">{t('salesTeams.builder.ladder.empty')}</p>
      ) : (
        <ol className="grid max-h-[28rem] gap-1 overflow-y-auto rounded-lg border border-[var(--border)] p-2">
          {rows.map((rule, index) => (
            <li
              key={rule.id}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-2',
                rule.isDraft ? 'bg-[var(--brand-accent-soft)] ring-1 ring-[var(--brand-accent)]' : 'hover:bg-[var(--surface-2)]',
                !rule.isDraft && !rule.active && 'opacity-60'
              )}
            >
              <span className="w-5 shrink-0 text-center text-xs text-[var(--text-light)]">{index + 1}</span>
              <span className="inline-flex h-7 min-w-9 shrink-0 items-center justify-center rounded-md bg-[var(--surface-2)] px-1.5 text-sm font-bold text-[var(--text)]" title={t('salesTeams.rules.priority')}>
                {rule.priority}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-[var(--text)]">
                    {rule.isDraft ? (form.name.trim() || t('salesTeams.builder.unnamed')) : rule.name || t('salesTeams.rules.fallbackName', { id: rule.id })}
                  </span>
                  {rule.isDraft && <Badge variant="info">{t('salesTeams.builder.priority.thisRule')}</Badge>}
                  {!rule.isDraft && !rule.active && <Badge>{t('salesTeams.builder.ladder.inactive')}</Badge>}
                </span>
                <RuleFacts rule={rule} context={context} labels={labels} />
              </span>
              {!rule.isDraft && (
                <span className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => onPick(priorityAbove(rule))}
                    className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] px-2 py-1 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface)]"
                    aria-label={t('salesTeams.builder.ladder.aboveLabel', { name: rule.name, value: priorityAbove(rule) })}
                  >
                    <ArrowUp size={12} aria-hidden="true" />
                    {t('salesTeams.builder.ladder.above')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onPick(priorityBelow(rule))}
                    className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] px-2 py-1 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface)]"
                    aria-label={t('salesTeams.builder.ladder.belowLabel', { name: rule.name, value: priorityBelow(rule) })}
                  >
                    <ArrowDown size={12} aria-hidden="true" />
                    {t('salesTeams.builder.ladder.below')}
                  </button>
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
