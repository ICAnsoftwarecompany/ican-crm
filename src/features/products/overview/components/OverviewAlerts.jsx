import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ModuleNotice } from '../../../../shared/components/module-pages'

/** Warnings at the top of the overview: no active item type for products and / or services (2026-10-15). */
export function OverviewAlerts({ alerts }) {
  const { t } = useTranslation()
  const items = [
    alerts.noProductTypes && { id: 'product', kind: 'product' },
    alerts.noServiceTypes && { id: 'service', kind: 'service' },
  ].filter(Boolean)
  if (!items.length) return null
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <ModuleNotice key={item.id} tone="warning">
          <span>{t(`productOverview.alerts.noTypes.${item.kind}`)}</span>{' '}
          <Link to={`/products/item-types/new?kind=${item.kind}`} className="font-semibold underline">{t(`productOverview.alerts.addType.${item.kind}`)}</Link>
        </ModuleNotice>
      ))}
    </div>
  )
}
