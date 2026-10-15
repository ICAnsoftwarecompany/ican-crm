import { useTranslation } from 'react-i18next'
import { AlertTriangle, ArrowLeft, Crown } from 'lucide-react'
import { Select } from '../../../../../../shared/components/ui/Select'
import { Avatar } from '../../../../../../shared/components/ui/Avatar'
import { Badge } from '../../../../../../shared/components/ui/Badge'
import { normalizeId, userLabel } from '../../../utils/teamModel'
import { normalizeRule, ruleWarnings, targetOf } from '../../../utils/ruleModel'
import { nextLeadsPreview, targetPreview } from '../../utils/ruleBuilder'

function TeamFacts({ team }) {
  const { t, i18n } = useTranslation()
  const names = new Intl.ListFormat(i18n.language, { type: 'conjunction' }).format(team.members.map(userLabel))
  return (
    <div className="grid gap-2 rounded-lg border border-[var(--border)] p-3 text-sm">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-semibold text-[var(--text)]">{team.name}</span>
        <Badge variant={team.active ? 'success' : 'danger'}>{t(team.active ? 'salesTeams.common.active' : 'salesTeams.common.inactive')}</Badge>
      </div>
      <p className="flex items-center gap-1.5 text-[var(--text-muted)]">
        <Crown size={14} className="text-amber-600 dark:text-amber-300" aria-hidden="true" />
        {t('salesTeams.teams.leader')}: <span className="font-semibold text-[var(--text)]">{team.leader ? userLabel(team.leader) : t('salesTeams.teams.noLeader')}</span>
      </p>
      <p className="text-[var(--text-muted)]">{t('salesTeams.teams.membersCount', { count: team.members.length })}{team.members.length > 0 && `: ${names}`}</p>
    </div>
  )
}

/** Step 4: the team (or user) that receives the leads, what that means in practice, and anything blocking it. */
export function TargetStep({ builder, context }) {
  const { t } = useTranslation()
  const { form, errors, setField } = builder
  const isUser = targetOf(form.assign_type) === 'user'
  const preview = targetPreview(form, context)
  const nextLeads = nextLeadsPreview(form, preview, 4)
  const warnings = (form.team_id || form.user_id) ? ruleWarnings(normalizeRule(form), context) : []

  return (
    <div className="grid gap-4">
      {isUser ? (
        <Select
          label={t('salesTeams.rules.targetUser')}
          value={form.user_id}
          onChange={(value) => setField('user_id', value)}
          error={errors.user_id ? t(`salesTeams.errors.${errors.user_id}`) : undefined}
          options={context.users.map((user) => ({ value: normalizeId(user.id), label: userLabel(user) }))}
        />
      ) : (
        <Select
          label={t('salesTeams.rules.targetTeam')}
          value={form.team_id}
          onChange={(value) => setField('team_id', value)}
          error={errors.team_id ? t(`salesTeams.errors.${errors.team_id}`) : undefined}
          options={context.teams.map((team) => ({ value: team.id, label: team.active ? team.name : `${team.name} (${t('salesTeams.common.inactive')})` }))}
        />
      )}

      {!isUser && context.teams.length === 0 && <p className="text-sm text-[var(--text-muted)]">{t('salesTeams.builder.target.noTeams')}</p>}
      {preview.team && <TeamFacts team={preview.team} />}

      {nextLeads.length > 0 && (
        <div className="rounded-lg bg-[var(--surface-2)] p-3">
          <p className="mb-2 text-xs font-semibold text-[var(--text-muted)]">{t('salesTeams.builder.target.nextLeads')}</p>
          <ol className="flex flex-wrap items-center gap-2">
            {nextLeads.map((user, index) => (
              <li key={`${index}-${user.id}`} className="flex items-center gap-1.5 text-xs text-[var(--text)]">
                <span className="text-[var(--text-light)]">{t('salesTeams.builder.target.leadNumber', { number: index + 1 })}</span>
                <ArrowLeft size={12} className="text-[var(--text-light)] ltr:rotate-180" aria-hidden="true" />
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
