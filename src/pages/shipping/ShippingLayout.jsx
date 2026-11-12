import { useTranslation } from 'react-i18next'
import { SubSidebarLayout } from '../../shared/components/sub-sidebar'
import { getShippingNavigation } from '../../features/shipping/navigation/shippingNavigation'

export function ShippingLayout() {
  const { t } = useTranslation()
  return <SubSidebarLayout storageKey="shipping-sidebar-collapsed" mobileId="shipping-mobile-sidebar" mobileLabel={t('nav.shippingNavigation')} sidebar={getShippingNavigation(t)} />
}
