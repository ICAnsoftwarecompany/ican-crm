import { useTranslation } from 'react-i18next'
import { CalendarRange } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { SchedulingWorkspace } from '../../features/service'

/** /service/scheduling — resources × day, holds and bookings. */
export function ServiceSchedulingPage() {
  const { t } = useTranslation()
  usePageHeader({ title: t('service.hub.title'), icon: CalendarRange })
  return <SchedulingWorkspace workOrderPath={(workOrder) => `/service/work-orders/${workOrder.id}`} />
}

export default ServiceSchedulingPage
