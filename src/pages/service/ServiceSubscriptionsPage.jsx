import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Repeat } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { SubscriptionDetailView, SubscriptionsWorkspace } from '../../features/service'

const detailPath = (subscription) => `/service/subscriptions/${subscription.id}`

/** /service/subscriptions/:subscriptionId? */
export function ServiceSubscriptionsPage() {
  const { t } = useTranslation()
  const { subscriptionId } = useParams()
  usePageHeader({ title: t('service.hub.title'), icon: Repeat })
  return subscriptionId ? (
    <SubscriptionDetailView subscriptionId={subscriptionId} backTo="/service/subscriptions" contractPath={(contractId) => `/service/contracts/${contractId}`} />
  ) : (
    <SubscriptionsWorkspace detailPath={detailPath} />
  )
}

export default ServiceSubscriptionsPage
