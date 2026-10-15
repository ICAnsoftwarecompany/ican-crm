import { useTranslation } from 'react-i18next'
import { AlertTriangle, Wand2 } from 'lucide-react'
import { Input } from '../../../../../../shared/components/ui/Input'
import { Button } from '../../../../../../shared/components/ui/Button'
import { placeRule, suggestPriority } from '../../utils/ruleBuilder'
import { PriorityLadder } from '../PriorityLadder'

/**
 * Step 5: priority and activation. Lists every existing rule with its priority (PriorityLadder) with this rule placed
 * live, lets the user put it right above / below any of them, and warns when an active rule above already catches
 * the same leads (first match wins — to confirm with the backend), has the same conditions, or the same priority.
 */
export function PriorityStep({ builder, context }) {
  const { t } = useTranslation()
  const { form, errors, setField } = builder
  const validPriority = !errors.priority && String(form.priority).trim() !== '' && Number.isInteger(Number(form.priority))
  const placement = validPriority ? placeRule(context.rules, form, context.editingId) : null
  const suggested = suggestPriority(context.rules, form, context.editingId)

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

      <PriorityLadder form={form} context={context} onPick={(value) => setField('priority', String(value))} />
      {!form.active && <p className="text-xs text-[var(--text-muted)]">{t('salesTeams.builder.priority.inactiveNote')}</p>}

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
