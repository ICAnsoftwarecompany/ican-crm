import { useTranslation } from 'react-i18next'
import { Crown, RefreshCw, User, UsersRound } from 'lucide-react'
import { cn } from '../../../../shared/utils/cn'
import { ASSIGN_TYPES } from '../utils/ruleModel'

export const ASSIGN_TYPE_ICONS = { round_robin: RefreshCw, team: UsersRound, team_leader: Crown, user: User }

/** The four assign types as radio cards, each with what it does. */
export function AssignTypePicker({ value, onChange, error }) {
  const { t } = useTranslation()

  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1.5 text-sm font-medium text-[var(--text)]">{t('salesTeams.rules.assignType')}</legend>
      <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
        {ASSIGN_TYPES.map((type) => {
          const Icon = ASSIGN_TYPE_ICONS[type]
          const selected = value === type
          return (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(type)}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-3 text-start transition-colors',
                selected ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]' : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
              )}
            >
              <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', selected ? 'bg-[var(--brand-accent)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-muted)]')}>
                <Icon size={16} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[var(--text)]">{t(`salesTeams.assignTypes.${type}.label`)}</span>
                <span className="mt-0.5 block text-xs leading-5 text-[var(--text-muted)]">{t(`salesTeams.assignTypes.${type}.description`)}</span>
              </span>
            </button>
          )
        })}
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-300">{error}</p>}
    </fieldset>
  )
}
