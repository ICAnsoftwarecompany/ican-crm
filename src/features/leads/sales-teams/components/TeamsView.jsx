import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Plus, UserX, Users, UsersRound } from 'lucide-react'
import { ModulePageHeader } from '../../../../shared/components/module-pages'
import { KpiRow } from '../../../../shared/components/reports'
import { Button } from '../../../../shared/components/ui/Button'
import { useSalesTeamsData } from '../hooks/useSalesTeamsData'
import { useTeamEditor } from '../hooks/useTeamEditor'
import { SALES_TEAMS_ROUTES, newRuleForTeam } from '../constants/salesTeamsRoutes'
import { TeamsSection } from './TeamsSection'
import { TeamDialog } from './TeamDialog'

/** /LeadsCenter/teams — the teams list, create / edit team (dialog). */
export function TeamsView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const data = useSalesTeamsData()
  const teamEditor = useTeamEditor()
  const { stats } = data

  const kpis = [
    { id: 'teams', icon: UsersRound, label: t('salesTeams.kpis.teams'), value: stats.teams, hint: t('salesTeams.kpis.activeOf', { count: stats.activeTeams }) },
    { id: 'users', icon: Users, label: t('salesTeams.kpis.users'), value: stats.users },
    { id: 'unassigned', icon: UserX, label: t('salesTeams.kpis.unassigned'), value: stats.unassignedUsers, hint: t('salesTeams.kpis.unassignedHint') },
  ]

  return (
    <div className="space-y-4">
      <ModulePageHeader
        icon={UsersRound}
        title={t('salesTeams.teams.pageTitle')}
        description={t('salesTeams.teams.pageDescription')}
        actions={<Button variant="accent" onClick={() => teamEditor.open()}><Plus size={16} />{t('salesTeams.teams.new')}</Button>}
      />
      <KpiRow items={kpis} />
      <TeamsSection
        data={data}
        onCreate={() => teamEditor.open()}
        onEdit={teamEditor.open}
        onAddRule={(team) => navigate(newRuleForTeam(team.id))}
        onShowRules={() => navigate(SALES_TEAMS_ROUTES.rules)}
      />
      {teamEditor.isOpen && <TeamDialog editor={teamEditor} users={data.users} usersLoading={data.usersQuery.isLoading} />}
    </div>
  )
}
