import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BadgeCheck } from 'lucide-react'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { cn } from '../../../../shared/utils/cn'
import { formatDate } from '../../../../shared/utils/dateTime'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useEntitlements } from '../api/entitlementsApi'
import { ENTITLEMENT_TONE, EntitlementBalance } from './EntitlementBalance'
import { EntitlementDrawer } from './EntitlementDrawer'

/** Entitlements list (hub tab, asset detail, customer tab). `params` filters server-side. */
export function EntitlementsList({ params = {}, showCustomer = true }) {
  const { t, i18n } = useTranslation()
  const query = useEntitlements(params)
  const [open, setOpen] = useState(null)
  const items = query.data?.data || []

  return (
    <>
      <ResourceState isLoading={query.isLoading} error={query.error} onRetry={query.refetch} empty={!items.length} emptyIcon={<BadgeCheck size={24} />} emptyTitle={t('service.entitlements.empty')}>
        <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          {items.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => setOpen(item.id)} className="grid w-full gap-2 px-4 py-3 text-start hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-accent sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
                <span className="grid min-w-0 gap-0.5">
                  <span className="text-sm font-medium text-[var(--text)]">{t(`service.entitlements.types.${item.type}`, { defaultValue: item.type })}</span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {[showCustomer && item.customer?.name, item.asset && localizeLabel(item.asset.name, i18n.language, ''), item.ends_at && t('service.entitlements.until', { date: formatDate(item.ends_at, i18n.language, { dateStyle: 'medium' }) })].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <EntitlementBalance balance={item.balance} compact />
                <span className={cn('text-xs font-semibold', ENTITLEMENT_TONE[item.status])}>{t(`service.entitlements.statuses.${item.status}`)}</span>
              </button>
            </li>
          ))}
        </ul>
      </ResourceState>
      <EntitlementDrawer entitlementId={open} onClose={() => setOpen(null)} />
    </>
  )
}
