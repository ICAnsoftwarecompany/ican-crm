import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { GitBranch, Plus } from 'lucide-react'
import { ModulePageHeader } from '../../../../shared/components/module-pages'
import { Button } from '../../../../shared/components/ui/Button'
import { useSalesTeamsData } from '../hooks/useSalesTeamsData'
import { useRuleToggle } from '../hooks/useRuleToggle'
import { SALES_TEAMS_ROUTES } from '../constants/salesTeamsRoutes'
import { RulesSection } from './RulesSection'

/** /LeadsCenter/teams/rules — distribution rules list; new / edit open the rule builder page. */
export function RulesView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const data = useSalesTeamsData()
  const ruleToggle = useRuleToggle()

  return (
    <div className="space-y-4">
      <ModulePageHeader
        icon={GitBranch}
        title={t('salesTeams.rules.pageTitle')}
        description={t('salesTeams.rules.pageDescription')}
        actions={<Button variant="accent" onClick={() => navigate(SALES_TEAMS_ROUTES.newRule)}><Plus size={16} />{t('salesTeams.rules.new')}</Button>}
      />
      <RulesSection
        data={data}
        togglingId={ruleToggle.togglingId}
        onToggle={ruleToggle.toggle}
        onEdit={(rule) => navigate(SALES_TEAMS_ROUTES.editRule(rule.id))}
        onCreate={() => navigate(SALES_TEAMS_ROUTES.newRule)}
      />
    </div>
  )
}
