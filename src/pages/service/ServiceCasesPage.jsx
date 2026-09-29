import { useTranslation } from 'react-i18next'
import { Inbox } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { CasesWorkspace, useServiceTerminology } from '../../features/service'

/** /service/cases — list/board of cases with server views. */
export function ServiceCasesPage() {
  const { t } = useTranslation()
  const term = useServiceTerminology()
  usePageHeader({ title: t('service.cases.pageTitle', { entity: term('case', 'other') }), icon: Inbox })

  return (
    <div className="p-4 lg:p-5">
      <CasesWorkspace />
    </div>
  )
}

export default ServiceCasesPage
