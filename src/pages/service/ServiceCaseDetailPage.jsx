import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Inbox } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { CaseDetailView, useServiceTerminology } from '../../features/service'

/** /service/cases/:caseId — one case: timeline, reply/note, status, properties. */
export function ServiceCaseDetailPage() {
  const { caseId } = useParams()
  const { t } = useTranslation()
  const term = useServiceTerminology()
  usePageHeader({ title: t('service.cases.pageTitle', { entity: term('case') }), icon: Inbox })

  return (
    <div className="p-4 lg:p-5">
      <CaseDetailView caseId={caseId} />
    </div>
  )
}

export default ServiceCaseDetailPage
