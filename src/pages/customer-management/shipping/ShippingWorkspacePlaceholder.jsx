import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

const labels = {
  '/shipping': 'shippingOverview',
  '/shipping/shipments': 'shipments',
  '/shipping/claims': 'shippingClaims',
  '/shipping/reports': 'shippingReports',
  '/shipping/settings': 'shippingSettings',
}

/** Navigation-first scaffold: no fabricated shipment data or backend calls. */
export function ShippingWorkspacePlaceholder() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  return (
    <section className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--text)]">
      <h1 className="text-xl font-semibold">{t(`nav.${labels[pathname] || 'shipping'}`)}</h1>
      <p className="mt-3 text-sm text-[var(--text-muted)]">{t('nav.shippingPending')}</p>
    </section>
  )
}
