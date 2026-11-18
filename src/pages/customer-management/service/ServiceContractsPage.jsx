import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileSignature } from 'lucide-react'
import { usePageHeader } from '../../../shared/hooks/usePageHeader'
import { ContractDetailView, ContractsWorkspace } from '../../../features/service'

const detailPath = (contract) => `/customer-management/service/contracts/${contract.id}`

/** /service/contracts/:contractId? */
export function ServiceContractsPage() {
  const { t } = useTranslation()
  const { contractId } = useParams()
  usePageHeader({ title: t('service.hub.title'), icon: FileSignature })
  return contractId ? (
    <ContractDetailView contractId={contractId} backTo="/customer-management/service/contracts" detailPath={detailPath} handoffPath={(handoff) => `/customer-management/service/handoffs/${handoff.id}`} schedulePath={(schedule) => `/customer-management/service/billing/schedules/${schedule.id}`} />
  ) : (
    <ContractsWorkspace detailPath={detailPath} />
  )
}

export default ServiceContractsPage
