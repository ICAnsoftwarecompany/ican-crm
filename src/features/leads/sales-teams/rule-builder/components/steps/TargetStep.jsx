import { useTranslation } from 'react-i18next'
import { AlertTriangle, ArrowLeft, User, UsersRound } from 'lucide-react'
import { Avatar } from '../../../../../../shared/components/ui/Avatar'
import { cn } from '../../../../../../shared/utils/cn'
import { userLabel } from '../../../utils/teamModel'
import { normalizeRule, ruleWarnings, targetOf } from '../../../utils/ruleModel'
import { nextLeadsPreview, targetPreview } from '../../utils/ruleBuilder'
import { useQuickTeam } from '../../hooks/useQuickTeam'
import { TeamChooser } from '../target/TeamChooser'
import { UserChooser } from '../target/UserChooser'
import { QuickTeamPanel } from '../target/QuickTeamPanel'

const MODES = [
  { id: 'team', icon: UsersRound },
  { id: 'user', icon: User },
]

/**
 * Step 4: who receives the leads — a team (pick one, or create a quick team from all users right here) or one
 * specific user from the full users list. Switching the mode switches the assign type (team ↔ user).
 */
export function TargetStep({ builder, context }) {
  const { t } = useTranslation()
  const { form, errors, setField, goTo } = builder
  const mode = targetOf(form.assign_type)
  const quick = useQuickTeam({ onCreated: (id) => id && setField('team_id', id) })
  const preview = targetPreview(form, context)
  const rotates = form.assign_type === 'round_robin'
  const nextLeads = nextLeadsPreview(form, preview, rotates ? 4 : 1)
  const warnings = (form.team_id || form.user_id) ? ruleWarnings(normalizeRule(form), context) : []

  const switchMode = (next) => {
    if (next === mode) return
    quick.close()
    setField('assign_type', next === 'user' ? 'user' : 'round_robin')
  }

  return (
    <div className="grid gap-4">
      <div role="tablist" aria-label={t('salesTeams.builder.target.modeLabel')} className="grid grid-cols-2 gap-2">
        {MODES.map(({ id, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mode === id}
            onClick={() => switchMode(id)}
            className={cn('flex items-start gap-2 rounded-lg border p-3 text-start transition-colors', mode === id ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]' : 'border-[var(--border)] hover:bg-[var(--surface-2)]')}
          >
            <Icon size={18} className="mt-0.5 shrink-0 text-[var(--brand-accent)]" aria-hidden="true" />
            <span>
              <span className="block text-sm font-semibold text-[var(--text)]">{t(`salesTeams.builder.target.modes.${id}.label`)}</span>
              <span className="block text-xs leading-5 text-[var(--text-muted)]">{t(`salesTeams.builder.target.modes.${id}.hint`)}</span>
            </span>
          </button>
        ))}
      </div>

      {mode === 'team' && (
        <p className="text-xs text-[var(--text-muted)]">
          {t('salesTeams.builder.target.methodNow', { type: t(`salesTeams.assignTypes.${form.assign_type}.label`) })}{' '}
          <button type="button" onClick={() => goTo('method')} className="font-semibold text-[var(--brand-accent)] hover:underline">{t('salesTeams.builder.target.changeMethod')}</button>
        </p>
      )}

      {mode === 'team' ? (
        <>
          <TeamChooser
            teams={context.teams}
            value={form.team_id}
            onChange={(id) => setField('team_id', id)}
            error={errors.team_id ? t(`salesTeams.errors.${errors.team_id}`) : undefined}
            quickOpen={quick.isOpen}
            onQuickTeam={() => quick.open({ name: form.name ? t('salesTeams.quickTeam.defaultName', { rule: form.name }) : '' })}
          />
          {quick.isOpen && <QuickTeamPanel quick={quick} users={context.users} usersLoading={context.usersLoading} />}
        </>
      ) : (
        <UserChooser
          users={context.users}
          teams={context.teams}
          value={form.user_id}
          onChange={(id) => setField('user_id', id)}
          error={errors.user_id ? t(`salesTeams.errors.${errors.user_id}`) : undefined}
        />
      )}

      {nextLeads.length > 0 && (
        <div className="rounded-lg bg-[var(--surface-2)] p-3">
          <p className="mb-2 text-xs font-semibold text-[var(--text-muted)]">{t(rotates ? 'salesTeams.builder.target.nextLeads' : 'salesTeams.builder.target.allLeadsTo')}</p>
          <ol className="flex flex-wrap items-center gap-2">
            {nextLeads.map((user, index) => (
              <li key={`${index}-${user.id}`} className="flex items-center gap-1.5 text-xs text-[var(--text)]">
                {rotates && (
                  <>
                    <span className="text-[var(--text-light)]">{t('salesTeams.builder.target.leadNumber', { number: index + 1 })}</span>
                    <ArrowLeft size={12} className="text-[var(--text-light)] ltr:rotate-180" aria-hidden="true" />
                  </>
                )}
                <Avatar name={userLabel(user)} size="sm" />
                <span className="font-semibold">{userLabel(user)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      {form.assign_type === 'team' && preview.team && (
        <p className="rounded-lg bg-[var(--surface-2)] p-3 text-xs leading-5 text-[var(--text-muted)]">{t('salesTeams.builder.target.sharedNote')}</p>
      )}

      {warnings.length > 0 && (
        <ul className="grid gap-1">
          {warnings.map((warning) => (
            <li key={warning} className="flex items-center gap-1.5 text-sm text-amber-700 dark:text-amber-300">
              <AlertTriangle size={14} className="shrink-0" aria-hidden="true" />
              {t(`salesTeams.warnings.${warning}`)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
