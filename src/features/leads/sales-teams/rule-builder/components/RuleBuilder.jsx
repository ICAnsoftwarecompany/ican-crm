import { useTranslation } from 'react-i18next'
import { SearchX } from 'lucide-react'
import { ResourceState } from '../../../../../shared/components/data/ResourceState'
import { EmptyState } from '../../../../../shared/components/feedback/EmptyState'
import { Button } from '../../../../../shared/components/ui/Button'
import { useSalesTeamsData } from '../../hooks/useSalesTeamsData'
import { toRuleForm } from '../../utils/ruleModel'
import { RuleBuilderForm } from './RuleBuilderForm'

/**
 * The "new / edit distribution rule" page body (2026-10-16). Loads teams, users and rules, finds the rule when
 * `ruleId` is set, then hands an initial form to `RuleBuilderForm`.
 * - `presetTeamId`: new rule for a team (from a team card), pre-selects it.
 * - `onDone()`: after save or cancel (the route page navigates back to the rules list).
 */
export function RuleBuilder({ ruleId = '', presetTeamId = '', onDone }) {
  const { t } = useTranslation()
  const data = useSalesTeamsData()
  const loading = data.rulesQuery.isLoading || data.teamsQuery.isLoading
  const error = data.rulesQuery.error || data.teamsQuery.error
  const rule = ruleId ? data.rules.find((item) => item.id === String(ruleId)) : null

  if (loading || error) {
    return <ResourceState isLoading={loading} error={error} onRetry={() => { data.rulesQuery.refetch(); data.teamsQuery.refetch() }} />
  }

  if (ruleId && !rule) {
    return (
      <EmptyState
        icon={<SearchX size={24} />}
        title={t('salesTeams.builder.notFound')}
        action={<Button variant="outline" onClick={onDone}>{t('salesTeams.builder.backToRules')}</Button>}
      />
    )
  }

  const presetTeam = presetTeamId ? data.teamById.get(String(presetTeamId)) : null
  const initialForm = rule
    ? toRuleForm(rule)
    : toRuleForm(null, presetTeam ? { team_id: presetTeam.id, name: t('salesTeams.rules.nameForTeam', { team: presetTeam.name }) } : {})

  return <RuleBuilderForm key={ruleId || 'new'} data={data} rule={rule} initialForm={initialForm} onDone={onDone} />
}
