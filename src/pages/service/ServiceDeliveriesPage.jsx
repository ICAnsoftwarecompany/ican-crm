import { useTranslation } from 'react-i18next'
import { Truck } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { DeliveriesWorkspace } from '../../features/service'

/** /service/deliveries — courier dispatch, proof of delivery and COD remittances. */
export function ServiceDeliveriesPage() {
  const { t } = useTranslation()
  usePageHeader({ title: t('service.hub.title'), icon: Truck })
  return <DeliveriesWorkspace />
}

export default ServiceDeliveriesPage
