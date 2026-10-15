import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { GitBranch, Plus, UserX, Users, UsersRound } from 'lucide-react'
import { ModulePageHeader } from '../../../../shared/components/module-pages'
import { KpiRow } from '../../../../shared/components/reports'
import { Tabs } from '../../../../shared/components/ui/Tabs'
import { Button } from '../../../../shared/components/ui/Button'
import { useSalesTeamsData } from '../hooks/useSalesTeamsData'
import { useTeamEditor } from '../hooks/useTeamEditor'
import { useRuleEditor } from '../hooks/useRuleEditor'
import { TeamsSection } from './TeamsSection'
import { RulesSection } from './RulesSection'
import { TeamDialog } from './TeamDialog'
import { RuleDialog } from './RuleDialog'

const TABS = ['teams', 'rules']

/**
 * /LeadsCenter/teams (and /LeadsCenter/assignments with `initialTab="rules"`): sales teams + the rules that
 * route new leads to them. The tab lives in `?tab=` so links can open the rules directly.
 */
export function SalesTeamsWorkspace({ initialTab = 'teams' }) {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const tab = TABS.includes(params.get('tab')) ? params.get('tab') : initialTab
  const data = useSalesTeamsData()
  const teamEditor = useTeamEditor()
  const ruleEditor = useRuleEditor()
  const { stats } = data

  const setTab = (next) => setParams((current) => {
    const copy = new URLSearchParams(current)
    copy.set('tab', next)
    return copy
  }, { replace: true })

  const kpis = [
    { id: 'teams', icon: UsersRound, label: t('salesTeams.kpis.teams'), value: stats.teams, hint: t('salesTeams.kpis.activeOf', { count: stats.activeTeams }) },
    { id: 'rules', icon: GitBranch, label: t('salesTeams.kpis.rules'), value: stats.rules, hint: t('salesTeams.kpis.activeOf', { count: stats.activeRules }) },
    { id: 'users', icon: Users, label: t('salesTeams.kpis.users'), value: stats.users },
    { id: 'unassigned', icon: UserX, label: t('salesTeams.kpis.unassigned'), value: stats.unassignedUsers, hint: t('salesTeams.kpis.unassignedHint') },
  ]

  const actions = tab === 'teams'
    ? <Button variant="accent" onClick={() => teamEditor.open()}><Plus size={16} />{t('salesTeams.teams.new')}</Button>
    : <Button variant="accent" onClick={() => ruleEditor.open()}><Plus size={16} />{t('salesTeams.rules.new')}</Button>

  return (
    <div className="space-y-4">
      <ModulePageHeader icon={UsersRound} title={t('salesTeams.title')} description={t('salesTeams.description')} actions={actions} />
      <KpiRow items={kpis} />
      <Tabs
        variant="underline"
        active={tab}
        onChange={setTab}
        items={[
          { id: 'teams', label: `${t('salesTeams.tabs.teams')} (${stats.teams})` },
          { id: 'rules', label: `${t('salesTeams.tabs.rules')} (${stats.rules})` },
        ]}
      />

      {tab === 'teams' ? (
        <TeamsSection
          data={data}
          onCreate={() => teamEditor.open()}
          onEdit={teamEditor.open}
          onAddRule={(team) => ruleEditor.open(null, { team_id: team.id, name: t('salesTeams.rules.nameForTeam', { team: team.name }) })}
          onShowRules={() => setTab('rules')}
        />
      ) : (
        <RulesSection data={data} editor={ruleEditor} />
      )}

      {teamEditor.isOpen && <TeamDialog editor={teamEditor} users={data.users} usersLoading={data.usersQuery.isLoading} />}
      {ruleEditor.isOpen && <RuleDialog editor={ruleEditor} teams={data.teams} users={data.users} />}
    </div>
  )
}
