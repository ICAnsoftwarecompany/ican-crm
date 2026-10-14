import { useTranslation } from 'react-i18next'
import { UserCheck } from 'lucide-react'
import { ModulePageHeader } from '../../../shared/components/module-pages'
import { AssignmentRulesPanel } from '../../../features/leads'

/** /LeadsCenter/assignments — lead assignment rules (moved here from the removed /leads page). */
export function CustomerAssignmentsPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <ModulePageHeader icon={UserCheck} title={t('customers.nav.leadDistribution')} description={t('customers.assignments.description')} />
      <AssignmentRulesPanel />
    </div>
  )
}
