import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ModuleNotice } from '../../../../shared/components/module-pages'

/**
 * Warnings at the top of the overview (2026-10-15): no active item type, and no category, for products and / or
 * services — each with a link to add one.
 */
export function OverviewAlerts({ alerts }) {
  const { t } = useTranslation()
  const items = [
    alerts.noProductTypes && { id: 'type-product', text: 'productOverview.alerts.noTypes.product', action: 'productOverview.alerts.addType.product', to: '/products/item-types/new?kind=product' },
    alerts.noServiceTypes && { id: 'type-service', text: 'productOverview.alerts.noTypes.service', action: 'productOverview.alerts.addType.service', to: '/products/item-types/new?kind=service' },
    alerts.noProductCategories && { id: 'category-product', text: 'productOverview.alerts.noCategories.product', action: 'productOverview.alerts.addCategory.product', to: '/products/categories' },
    alerts.noServiceCategories && { id: 'category-service', text: 'productOverview.alerts.noCategories.service', action: 'productOverview.alerts.addCategory.service', to: '/products/service-categories' },
  ].filter(Boolean)
  if (!items.length) return null
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <ModuleNotice key={item.id} tone="warning">
          <span>{t(item.text)}</span>{' '}
          <Link to={item.to} className="font-semibold underline">{t(item.action)}</Link>
        </ModuleNotice>
      ))}
    </div>
  )
}
