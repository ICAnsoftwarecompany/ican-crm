import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ChannelDistributionView, RuleBuilder, RulesView, SALES_TEAMS_ROUTES, SalesTeamsReportView, SalesUsersView, TeamsView } from '../../features/leads'

/** Route pages of the sales teams area (2026-10-16) — composition only, logic in features/leads/sales-teams. */
export function SalesTeamsPage() {
  return <TeamsView />
}

export function SalesTeamsRulesPage() {
  return <RulesView />
}

export function SalesTeamsRuleBuilderPage() {
  const navigate = useNavigate()
  const { ruleId = '' } = useParams()
  const [params] = useSearchParams()
  return <RuleBuilder ruleId={ruleId} presetTeamId={params.get('team') || ''} onDone={() => navigate(SALES_TEAMS_ROUTES.rules)} />
}

export function SalesTeamsReportsPage() {
  return <SalesTeamsReportView />
}

export function SalesTeamsUsersPage() {
  return <SalesUsersView />
}

export function SalesTeamsChannelsPage() {
  return <ChannelDistributionView />
}
