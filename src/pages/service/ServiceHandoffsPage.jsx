import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileCheck2 } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { HandoffDetailView, HandoffsWorkspace } from '../../features/service'

/** /service/handoffs/:handoffId? */
export function ServiceHandoffsPage() {
  const { t } = useTranslation()
  const { handoffId } = useParams()
  usePageHeader({ title: t('service.hub.title'), icon: FileCheck2 })
  return handoffId ? (
    <HandoffDetailView handoffId={handoffId} backTo="/service/handoffs" contractPath={(contract) => `/service/contracts/${contract.id}`} />
  ) : (
    <HandoffsWorkspace detailPath={(handoff) => `/service/handoffs/${handoff.id}`} />
  )
}

export default ServiceHandoffsPage
