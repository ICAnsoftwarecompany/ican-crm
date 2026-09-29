import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { cn } from '../../../../shared/utils/cn'
import { formatDate } from '../../../../shared/utils/dateTime'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { useEntitlement, useEntitlementTransaction } from '../api/entitlementsApi'
import { ENTITLEMENT_TONE, EntitlementBalance } from './EntitlementBalance'

const SIGN = { consume: '−', restore: '+', adjust: '±', expire: '×', reset: '↺' }

/** One entitlement: balance, validity and the ledger, with manual adjustments. */
export function EntitlementDrawer({ entitlementId, onClose }) {
  const { t, i18n } = useTranslation()
  const entitlement = useEntitlement(entitlementId)
  const add = useEntitlementTransaction(entitlementId)
  const [form, setForm] = useState({ type: 'consume', quantity: 1, reason: '' })
  const errors = getServiceFieldErrors(add.error)
  const item = entitlement.data
  const date = (value) => (value ? formatDate(value, i18n.language, { dateStyle: 'medium' }) : '—')

  return (
    <AppDrawer open={Boolean(entitlementId)} onClose={onClose} title={item ? t(`service.entitlements.types.${item.type}`) : ''} description={item?.customer?.name} size="md" pushPage={false}>
      <ResourceState isLoading={entitlement.isLoading} error={entitlement.error} onRetry={entitlement.refetch}>
        {item && (
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border)] p-3">
              <EntitlementBalance balance={item.balance} />
              <span className={cn('text-xs font-semibold', ENTITLEMENT_TONE[item.status])}>{t(`service.entitlements.statuses.${item.status}`)}</span>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-xs text-[var(--text-muted)]">{t('service.entitlements.validity')}</dt><dd className="text-[var(--text)]">{t('service.entitlements.range', { from: date(item.starts_at), to: date(item.ends_at) })}</dd></div>
              <div><dt className="text-xs text-[var(--text-muted)]">{t('service.entitlements.period')}</dt><dd className="text-[var(--text)]">{t(`service.entitlements.periods.${item.period}`, { defaultValue: item.period })}</dd></div>
              <div><dt className="text-xs text-[var(--text-muted)]">{t('service.entitlements.source')}</dt><dd className="text-[var(--text)]">{t(`service.entitlements.sources.${item.source_type}`, { defaultValue: item.source_type })}</dd></div>
              {item.asset && <div><dt className="text-xs text-[var(--text-muted)]">{t('service.hub.assets')}</dt><dd className="text-[var(--text)]">{localizeLabel(item.asset.name, i18n.language, '')} <span dir="ltr" className="text-xs text-[var(--text-muted)]">{item.asset.serial_number}</span></dd></div>}
            </dl>

            <form
              className="grid gap-2 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-[8rem_5rem_minmax(0,1fr)_auto] sm:items-end"
              onSubmit={(event) => {
                event.preventDefault()
                add.mutate({ ...form, quantity: Number(form.quantity) }, { onSuccess: () => setForm({ type: 'consume', quantity: 1, reason: '' }) })
              }}
            >
              <Select label={t('service.entitlements.movement')} value={form.type} onChange={(type) => setForm((current) => ({ ...current, type: type || 'consume' }))} options={['consume', 'restore', 'adjust'].map((value) => ({ value, label: t(`service.entitlements.movements.${value}`) }))} />
              <Input type="number" dir="ltr" label={t('service.entitlements.quantity')} value={form.quantity} error={errors.quantity && t('service.settings.validation.required')} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} />
              <Input label={t('service.entitlements.reason')} dir="auto" value={form.reason} error={errors.reason && t('service.settings.validation.required')} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} />
              <Button type="submit" loading={add.isPending}>{t('service.entitlements.record')}</Button>
            </form>

            <section className="grid gap-2">
              <h3 className="text-sm font-semibold text-[var(--text)]">{t('service.entitlements.ledger')}</h3>
              {!item.transactions?.length && <p className="text-xs text-[var(--text-muted)]">{t('service.entitlements.noLedger')}</p>}
              <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
                {(item.transactions || []).map((entry) => (
                  <li key={entry.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                    <span className="w-10 font-semibold text-[var(--text)]" dir="ltr">{SIGN[entry.type]}{entry.quantity}</span>
                    <span className="grid flex-1">
                      <span className="text-[var(--text)]">{t(`service.entitlements.movements.${entry.type}`)} · <bdi>{localizeLabel(entry.reason, i18n.language, '')}</bdi></span>
                      <span className="text-xs text-[var(--text-muted)]">{date(entry.created_at)} · {entry.created_by?.name}{entry.source_id ? ` · ${entry.source_id}` : ''}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </ResourceState>
    </AppDrawer>
  )
}
