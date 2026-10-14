import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Wrench } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { WorkOrderDetailView, WorkOrdersWorkspace } from '../../features/service'

const detailPath = (workOrder) => `/service/work-orders/${workOrder.id}`

/** /service/work-orders/:workOrderId? */
export function ServiceWorkOrdersPage() {
  const { t } = useTranslation()
  const { workOrderId } = useParams()
  usePageHeader({ title: t('service.hub.title'), icon: Wrench })
  return workOrderId ? <WorkOrderDetailView workOrderId={workOrderId} backTo="/service/work-orders" assetPath={(asset) => `/service/assets/${asset.id}`} /> : <WorkOrdersWorkspace detailPath={detailPath} />
}

export default ServiceWorkOrdersPage
