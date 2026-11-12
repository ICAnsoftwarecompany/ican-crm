import { BarChart3, ClipboardList, Package, Settings2, Truck } from 'lucide-react'

/** Shipping navigation only; no backend/API assumptions. */
export function getShippingNavigation(t) {
  return {
    header: { icon: Truck, title: t('nav.shipping'), description: t('nav.shippingDescription') },
    ariaLabel: t('nav.shippingNavigation'),
    groups: [{ id: 'shipping-operations', items: [
      { id: 'overview', to: '/shipping', end: true, label: t('nav.shippingOverview'), icon: Truck },
      { id: 'shipments', to: '/shipping/shipments', label: t('nav.shipments'), icon: Package },
      { id: 'claims', to: '/shipping/claims', label: t('nav.shippingClaims'), icon: ClipboardList },
      { id: 'reports', to: '/shipping/reports', label: t('nav.shippingReports'), icon: BarChart3 },
    ] }],
    footerItems: [{ id: 'settings', to: '/shipping/settings', label: t('nav.shippingSettings'), icon: Settings2 }],
  }
}
