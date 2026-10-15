import { useTranslation } from 'react-i18next'
import { AlertTriangle, Wand2 } from 'lucide-react'
import { Input } from '../../../../../../shared/components/ui/Input'
import { Button } from '../../../../../../shared/components/ui/Button'
import { cn } from '../../../../../../shared/utils/cn'
import { placeRule, suggestPriority } from '../../utils/ruleBuilder'

const VISIBLE_AROUND = 3

/**
 * Step 5: priority and activation. Shows where the rule lands among the active rules and warns when a rule above
 * already catches the same leads (first match wins — to confirm with the backend), or has the same conditions.
 */
export function PriorityStep({ builder, context }) {
  const { t } = useTranslation()
  const { form, errors, setField } = builder
  const validPriority = !errors.priority && String(form.priority).trim() !== '' && Number.isInteger(Number(form.priority))
  const placement = validPriority ? placeRule(context.rules, form, context.editingId) : null
  const suggested = suggestPriority(context.rules, form, context.editingId)
  const start = placement ? Math.max(0, placement.position - VISIBLE_AROUND) : 0
  const shown = placement ? placement.ordered.slice(start, placement.position + VISIBLE_AROUND + 1) : []

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <Input
            type="number"
            min="0"
            step="1"
            label={t('salesTeams.rules.priority')}
            value={form.priority}
            onChange={(event) => setField('priority', event.target.value)}
            error={errors.priority ? t(`salesTeams.errors.${errors.priority}`) : undefined}
          />
        </div>
        {suggested !== null && String(suggested) !== String(form.priority) && (
          <Button variant="outline" onClick={() => setField('priority', String(suggested))}>
            <Wand2 size={15} />
            {t('salesTeams.builder.priority.useSuggested', { value: suggested })}
          </Button>
        )}
      </div>

      <label className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm text-[var(--text)]">
        <input type="checkbox" className="h-4 w-4 accent-[var(--brand-accent)]" checked={form.active} onChange={(event) => setField('active', event.target.checked)} />
        {t('salesTeams.rules.activeLabel')}
        <span className="text-xs text-[var(--text-muted)]">— {t('salesTeams.builder.priority.activeHint')}</span>
      </label>

      {placement && (
        <div className="grid gap-2">
          <p className="text-sm font-semibold text-[var(--text)]">
            {t('salesTeams.builder.priority.position', { position: placement.position + 1, total: placement.ordered.length })}
          </p>
          <ol className="grid gap-1 rounded-lg border border-[var(--border)] p-2">
            {start > 0 && <li className="px-2 text-xs text-[var(--text-light)]">{t('salesTeams.builder.priority.moreAbove', { count: start })}</li>}
            {shown.map((rule, index) => (
              <li
                key={rule.id}
                className={cn('flex items-center gap-2 rounded-md px-2 py-1.5 text-sm', rule.isDraft ? 'bg-[var(--brand-accent-soft)] font-semibold text-[var(--text)]' : 'text-[var(--text-muted)]')}
              >
                <span className="w-6 text-xs text-[var(--text-light)]">{start + index + 1}</span>
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded bg-[var(--surface-2)] px-1 text-xs font-bold">{rule.priority}</span>
                <span className="min-w-0 truncate">{rule.isDraft ? (form.name.trim() || t('salesTeams.builder.unnamed')) : rule.name}</span>
                {rule.isDraft && <span className="ms-auto text-xs text-[var(--brand-accent)]">{t('salesTeams.builder.priority.thisRule')}</span>}
              </li>
            ))}
            {placement.ordered.length > start + shown.length && (
              <li className="px-2 text-xs text-[var(--text-light)]">{t('salesTeams.builder.priority.moreBelow', { count: placement.ordered.length - start - shown.length })}</li>
            )}
          </ol>
          {!form.active && <p className="text-xs text-[var(--text-muted)]">{t('salesTeams.builder.priority.inactiveNote')}</p>}
        </div>
      )}

      {placement && (placement.shadowedBy.length > 0 || placement.sameAs.length > 0 || placement.tiesWith.length > 0) && (
        <ul className="grid gap-1.5">
          {placement.shadowedBy.length > 0 && <Warning text={t('salesTeams.builder.priority.shadowed', { names: placement.shadowedBy.map((rule) => rule.name).join(' · ') })} />}
          {placement.sameAs.length > 0 && <Warning text={t('salesTeams.builder.priority.duplicate', { names: placement.sameAs.map((rule) => rule.name).join(' · ') })} />}
          {placement.tiesWith.length > 0 && <Warning text={t('salesTeams.builder.priority.tie', { names: placement.tiesWith.map((rule) => rule.name).join(' · ') })} />}
        </ul>
      )}
    </div>
  )
}

function Warning({ text }) {
  return (
    <li className="flex items-start gap-1.5 text-sm text-amber-700 dark:text-amber-300">
      <AlertTriangle size={14} className="mt-1 shrink-0" aria-hidden="true" />
      <span>{text}</span>
    </li>
  )
}
