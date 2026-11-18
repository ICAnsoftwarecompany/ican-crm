import { useTranslation } from 'react-i18next'
import { BarChart3 } from 'lucide-react'
import { usePageHeader } from '../../../shared/hooks/usePageHeader'
import { ReportsWorkspace } from '../../../features/service'
import { useCustomerManagementTemplate } from '../../../features/customer-management/industryTemplates'

/** /service/reports — overview dashboard and customer feedback. */
export function ServiceReportsPage() {
  const { t } = useTranslation()
  const industry = useCustomerManagementTemplate()
  usePageHeader({ title: t('service.reports.title'), icon: BarChart3 })
  return (
    <div className="p-4 lg:p-5">
      <ReportsWorkspace allowedTabs={industry.template.reports.tabs} />
    </div>
  )
}

export default ServiceReportsPage
