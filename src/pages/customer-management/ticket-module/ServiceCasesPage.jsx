import { useTranslation } from 'react-i18next'
import { Inbox } from 'lucide-react'
import { usePageHeader } from '../../../shared/hooks/usePageHeader'
import { CasesWorkspace, useServiceTerminology } from '../../../features/service'
import { useCustomerManagementTemplate } from '../../../features/customer-management/industryTemplates'

/** /service/cases — list/board of cases with server views. */
export function ServiceCasesPage() {
  const { t } = useTranslation()
  const industry = useCustomerManagementTemplate()
  const term = useServiceTerminology(industry.template.tickets.termKey)
  usePageHeader({ title: t('service.cases.pageTitle', { entity: term('case', 'other') }), icon: Inbox })

  return (
    <div className="p-4 lg:p-5">
      <CasesWorkspace industryTemplate={industry.template.tickets} />
    </div>
  )
}

export default ServiceCasesPage
