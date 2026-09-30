import { useTranslation } from 'react-i18next'
import { portalEndpoints as P } from '../../../service/portal-transport'
import { usePortalList } from '../../api/portalApi'
import { usePortalAccess } from '../../hooks/usePortalAccess'
import { usePortalFormat } from '../../utils/format'
import { Card, PortalPage, StatusPill } from '../PortalPage'

const ENT_TONE = { active: 'ok', exhausted: 'warn', expired: 'muted', suspended: 'bad' }
const SUB_TONE = { trial: 'info', active: 'ok', past_due: 'warn', suspended: 'bad', cancelled: 'muted', expired: 'muted' }

/** What the customer has: assets with warranty, remaining entitlements, subscriptions and signed contracts. */
export function PortalAssets() {
  const { t } = useTranslation()
  const format = usePortalFormat()
  const { can } = usePortalAccess()
  const assets = usePortalList('assets', P.assets, undefined, { enabled: can('asset') })
  const entitlements = usePortalList('entitlements', P.entitlements, undefined, { enabled: can('entitlement') })
  const subscriptions = usePortalList('subscriptions', P.subscriptions, undefined, { enabled: can('subscription') })
  const contracts = usePortalList('contracts', P.contracts, undefined, { enabled: can('contract') })

  return (
    <PortalPage title={t('portal.sections.assets')} description={t('portal.assets.description')}>
      {can('asset') && (
        <PortalPage level={2} title={t('portal.assets.assets')} query={assets} empty={!assets.data?.length} emptyTitle={t('portal.assets.noAssets')}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {(assets.data || []).map((asset) => (
              <Card key={asset.id} className="grid gap-1">
                <span className="font-semibold">{format.label(asset.name)}</span>
                <span dir="ltr" className="text-start text-xs text-[var(--text-muted)]">{asset.serial_number}</span>
                <span className="text-xs">{asset.warranty_ends_at ? <StatusPill tone="ok">{t('portal.assets.warrantyUntil', { date: format.date(asset.warranty_ends_at) })}</StatusPill> : <StatusPill>{t('portal.assets.noWarranty')}</StatusPill>}</span>
              </Card>
            ))}
          </ul>
        </PortalPage>
      )}
      {can('entitlement') && (
        <PortalPage level={2} title={t('portal.assets.entitlements')} query={entitlements} empty={!entitlements.data?.length} emptyTitle={t('portal.assets.noEntitlements')}>
          <Card>
            <ul className="divide-y divide-[var(--border)] text-sm">
              {(entitlements.data || []).map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span>{t(`portal.assets.entitlementTypes.${entry.type}`, { defaultValue: entry.type })}{entry.ends_at && <span className="text-xs text-[var(--text-muted)]"> · {t('portal.assets.until', { date: format.date(entry.ends_at) })}</span>}</span>
                  <span className="flex items-center gap-2">{entry.balance?.remaining != null && <span className="text-xs">{t('portal.assets.remaining', { remaining: entry.balance.remaining, quota: entry.balance.quota })}</span>}<StatusPill tone={ENT_TONE[entry.status]}>{t(`portal.assets.entitlementStatuses.${entry.status}`)}</StatusPill></span>
                </li>
              ))}
            </ul>
          </Card>
        </PortalPage>
      )}
      {can('subscription') && (
        <PortalPage level={2} title={t('portal.assets.subscriptions')} query={subscriptions} empty={!subscriptions.data?.length} emptyTitle={t('portal.assets.noSubscriptions')}>
          <Card>
            <ul className="divide-y divide-[var(--border)] text-sm">
              {(subscriptions.data || []).map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span>{format.label(entry.item_name)} · <span dir="ltr">{format.money(entry.plan?.price)}</span>{entry.current_period_end && <span className="text-xs text-[var(--text-muted)]"> · {t('portal.assets.renews', { date: format.date(entry.current_period_end) })}</span>}</span>
                  <StatusPill tone={SUB_TONE[entry.status]}>{t(`portal.assets.subscriptionStatuses.${entry.status}`)}</StatusPill>
                </li>
              ))}
            </ul>
          </Card>
        </PortalPage>
      )}
      {can('contract') && (
        <PortalPage level={2} title={t('portal.assets.contracts')} query={contracts} empty={!contracts.data?.length} emptyTitle={t('portal.assets.noContracts')}>
          <Card>
            <ul className="divide-y divide-[var(--border)] text-sm">
              {(contracts.data || []).map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span><span dir="ltr" className="font-mono text-xs">{entry.contract_number}</span> · {format.date(entry.start_date)}{entry.end_date ? ` – ${format.date(entry.end_date)}` : ''}</span>
                  <span dir="ltr" className="font-semibold">{format.money(entry.total_value, entry.currency)}</span>
                </li>
              ))}
            </ul>
            <p className="pt-2 text-xs text-[var(--text-muted)]">{t('portal.assets.pdfLater')}</p>
          </Card>
        </PortalPage>
      )}
    </PortalPage>
  )
}
