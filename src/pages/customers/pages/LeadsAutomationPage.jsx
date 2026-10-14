import { useTranslation } from 'react-i18next'
import { Workflow } from 'lucide-react'
import { ModulePageHeader } from '../../../shared/components/module-pages'
import { WorkflowModuleWorkspace } from '../../../features/workflow-engine'

/** /LeadsCenter/automation — the shared automation flow in the `leads` workflow module (added 2026-10-01). */
export function LeadsAutomationPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <ModulePageHeader icon={Workflow} title={t('customers.nav.automation')} description={t('customers.automation.description')} />
      <WorkflowModuleWorkspace context={{ module: 'leads', entity: 'lead', source: 'leads-center-automation' }} />
    </div>
  )
}
