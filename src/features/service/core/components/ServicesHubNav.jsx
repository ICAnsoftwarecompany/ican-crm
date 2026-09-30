import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../../shared/utils/cn'
import { useServiceCapabilities } from '../capabilities/useServiceCapabilities'
import { localizeLabel } from '../utils/localizeLabel'
import { useRecordsSetup } from '../../records/hooks/useRecords'

/**
 * Tabs of the "Services" hub (one sidebar item): one tab per record type, its
 * batches, then assets / contracts / handoffs when the tenant has them.
 * Tabs come from configuration and features — never from the industry.
 */
export function ServicesHubNav({ basePath = '/service' }) {
  const { t, i18n } = useTranslation()
  const { hasFeature } = useServiceCapabilities()
  const setup = useRecordsSetup()
  const language = i18n.language
  const types = (setup.data?.record_types || []).filter((type) => type.active !== false)

  const tabs = [
    ...types.map((type) => ({ key: `r-${type.key}`, to: `${basePath}/records/${type.key}`, label: localizeLabel(type.label, language, type.key) })),
    ...types.filter((type) => type.batch_enabled).map((type) => ({ key: `b-${type.key}`, to: `${basePath}/batches/${type.key}`, label: localizeLabel(type.batch_label, language, t('service.records.fields.batch')) })),
    hasFeature('assets') && { key: 'assets', to: `${basePath}/assets`, label: t('service.hub.assets') },
    hasFeature('entitlements') && { key: 'entitlements', to: `${basePath}/entitlements`, label: t('service.hub.entitlements') },
    hasFeature('courierAssignment') && { key: 'deliveries', to: `${basePath}/deliveries`, label: t('service.hub.deliveries') },
    hasFeature('workOrders') && { key: 'work-orders', to: `${basePath}/work-orders`, label: t('service.hub.workOrders') },
    (hasFeature('scheduling') || hasFeature('workOrders') || hasFeature('courierAssignment')) && { key: 'scheduling', to: `${basePath}/scheduling`, label: t('service.hub.scheduling') },
    hasFeature('subscriptions') && { key: 'subscriptions', to: `${basePath}/subscriptions`, label: t('service.hub.subscriptions') },
    { key: 'follow-ups', to: `${basePath}/follow-ups`, label: t('service.hub.followUps') },
    { key: 'contracts', to: `${basePath}/contracts`, label: t('service.hub.contracts') },
    { key: 'handoffs', to: `${basePath}/handoffs`, label: t('service.hub.handoffs') },
    { key: 'billing', to: `${basePath}/billing`, label: t('service.hub.billing') },
  ].filter(Boolean)

  return (
    <nav aria-label={t('service.hub.title')} className="flex gap-1 overflow-x-auto border-b border-[var(--border)]">
      {tabs.map((tab) => (
        <NavLink
          key={tab.key}
          to={tab.to}
          className={({ isActive }) =>
            cn(
              'shrink-0 border-b-2 px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent',
              isActive ? 'border-brand-accent font-semibold text-[var(--text)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
