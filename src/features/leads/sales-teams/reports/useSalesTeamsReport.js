import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, GitBranch, UserX, UsersRound } from 'lucide-react'
import { useSalesTeamsData } from '../hooks/useSalesTeamsData'
import { buildSalesTeamsReport } from './salesTeamsReportModel'

const SPECIAL_KEYS = { __other__: 'reports.other' }

/** KPIs + chart configs for the sales teams "Reports & statistics" page (shared ReportsPage). */
export function useSalesTeamsReport() {
  const { t } = useTranslation()
  const data = useSalesTeamsData()
  const { teams, rules, users, teamById, userById } = data

  const model = useMemo(() => {
    const report = buildSalesTeamsReport({ teams, rules, users, teamById, userById })
    const rows = (list, labelFor) => list.map((row) => ({
      key: row.key,
      value: row.value,
      label: SPECIAL_KEYS[row.key] ? t(SPECIAL_KEYS[row.key]) : labelFor(row.key),
      colorIndex: row.key === '__other__' ? -1 : undefined,
    }))

    const kpis = [
      { id: 'teams', icon: UsersRound, label: t('salesTeams.reports.kpis.activeTeams'), value: report.activeTeams, hint: t('salesTeams.reports.kpis.averageSize', { value: report.averageTeamSize }) },
      { id: 'rules', icon: GitBranch, label: t('salesTeams.reports.kpis.activeRules'), value: report.activeRules, hint: t('salesTeams.reports.kpis.catchAll', { count: report.catchAllRules }) },
      { id: 'unassigned', icon: UserX, label: t('salesTeams.kpis.unassigned'), value: report.unassignedUsers, positiveIsGood: false },
      { id: 'attention', icon: AlertTriangle, label: t('salesTeams.reports.kpis.needsAttention'), value: report.rulesWithWarnings + report.teamsWithoutRules, positiveIsGood: false, hint: t('salesTeams.reports.kpis.needsAttentionHint', { rules: report.rulesWithWarnings, teams: report.teamsWithoutRules }) },
    ]

    const charts = [
      {
        id: 'team-sizes',
        type: 'bar',
        size: 'wide',
        title: t('salesTeams.reports.charts.teamSizes'),
        data: report.teamSizes,
        series: [
          { key: 'members', label: t('salesTeams.reports.series.members') },
          { key: 'leader', label: t('salesTeams.reports.series.leader') },
        ],
        options: { stacked: true },
      },
      { id: 'by-assign-type', type: 'bar', title: t('salesTeams.reports.charts.byAssignType'), valueLabel: t('salesTeams.reports.series.rules'), data: rows(report.rulesByAssignType, (key) => t(`salesTeams.assignTypes.${key}.label`)) },
      { id: 'by-source', type: 'bar', title: t('salesTeams.reports.charts.bySource'), valueLabel: t('salesTeams.reports.series.rules'), data: rows(report.rulesBySource, (key) => (key === '__none__' ? t('salesTeams.rules.anyValue') : t(`salesTeams.sources.${key}`, { defaultValue: key }))) },
      { id: 'by-team', type: 'bar', title: t('salesTeams.reports.charts.byTeam'), valueLabel: t('salesTeams.reports.series.rules'), data: rows(report.rulesByTeam, (key) => teamById.get(key)?.name || `#${key}`) },
      { id: 'by-type', type: 'bar', title: t('salesTeams.reports.charts.teamsByType'), valueLabel: t('salesTeams.reports.series.teams'), data: rows(report.teamsByType, (key) => t(`salesTeams.teamTypes.${key}.label`, { defaultValue: key })) },
    ]
    return { kpis, charts }
  }, [teams, rules, users, teamById, userById, t])

  const queries = [data.teamsQuery, data.rulesQuery, data.usersQuery]
  return {
    ...model,
    isLoading: queries.some((query) => query.isLoading),
    error: queries.find((query) => query.error)?.error || null,
    refetch: () => queries.forEach((query) => query.refetch()),
  }
}
