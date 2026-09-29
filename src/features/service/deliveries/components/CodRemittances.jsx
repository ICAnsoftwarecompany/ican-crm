import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { formatDate } from '../../../../shared/utils/dateTime'
import { useMoney } from '../../billing/utils/money'
import { useDeliveryMutations, usePendingRemittances, useRemittances } from '../api/deliveriesApi'

/** COD remittances (spec §29.14): collected cash per merchant → remittance (fees deducted) → paid. Accounting is in the ERP. */
export function CodRemittances() {
  const { t, i18n } = useTranslation()
  const money = useMoney('EGP', 0)
  const pending = usePendingRemittances()
  const remittances = useRemittances()
  const { createRemittance, payRemittance, deleteRemittance } = useDeliveryMutations()
  const [paying, setPaying] = useState(null)
  const [reference, setReference] = useState('')
  const date = (value) => (value ? formatDate(value, i18n.language, { dateStyle: 'medium' }) : '—')

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="grid content-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-sm font-semibold text-[var(--text)]">{t('service.deliveries.cod.pending')}</h2>
        <ResourceState isLoading={pending.isLoading} error={pending.error} onRetry={pending.refetch} empty={!pending.data?.length} emptyTitle={t('service.deliveries.cod.nothingPending')}>
          <ul className="grid gap-2">
            {(pending.data || []).map((group) => (
              <li key={group.customer.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-[var(--surface-2)] px-3 py-2">
                <span className="grid text-sm">
                  <span className="font-medium text-[var(--text)]">{group.customer.name}</span>
                  <span className="text-xs text-[var(--text-muted)]">{t('service.deliveries.cod.summary', { count: group.count })} · <span dir="ltr">{money(group.total_collected)}</span> − <span dir="ltr">{money(group.fees_deducted)}</span> = <span dir="ltr" className="font-semibold text-[var(--text)]">{money(group.net_amount)}</span></span>
                </span>
                <Button size="sm" loading={createRemittance.isPending && createRemittance.variables === group.customer.id} onClick={() => createRemittance.mutate(group.customer.id, { onSuccess: () => toast.success(t('service.deliveries.done.remittanceCreated')) })}>{t('service.deliveries.cod.create')}</Button>
              </li>
            ))}
          </ul>
        </ResourceState>
      </section>
      <section className="grid content-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-sm font-semibold text-[var(--text)]">{t('service.deliveries.cod.remittances')}</h2>
        <ResourceState isLoading={remittances.isLoading} error={remittances.error} onRetry={remittances.refetch} empty={!remittances.data?.length} emptyTitle={t('service.deliveries.cod.noRemittances')}>
          <ul className="divide-y divide-[var(--border)]">
            {(remittances.data || []).map((remittance) => (
              <li key={remittance.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="grid text-sm">
                  <span className="text-[var(--text)]"><span dir="ltr" className="font-mono text-xs text-[var(--text-muted)]">{remittance.number}</span> {remittance.customer?.name}</span>
                  <span className="text-xs text-[var(--text-muted)]">{t('service.deliveries.cod.net')}: <span dir="ltr" className="font-semibold text-[var(--text)]">{money(remittance.net_amount)}</span> · {t('service.deliveries.cod.lines', { count: remittance.lines.length })} · {date(remittance.created_at)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className={remittance.status === 'paid' ? 'text-xs text-sla-on-track' : 'text-xs text-sla-at-risk'}>{t(`service.deliveries.cod.statuses.${remittance.status}`)}{remittance.paid_at ? ` · ${date(remittance.paid_at)}` : ''}</span>
                  {remittance.status === 'draft' && (
                    <>
                      <Button size="sm" onClick={() => { setReference(''); setPaying(remittance) }}>{t('service.deliveries.cod.markPaid')}</Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteRemittance.mutate(remittance.id, { onSuccess: () => toast.success(t('service.deliveries.done.remittanceDeleted')) })}>{t('service.deliveries.cod.discard')}</Button>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </ResourceState>
      </section>
      <FormDialog open={Boolean(paying)} onClose={() => setPaying(null)} title={t('service.deliveries.cod.markPaid')} description={paying ? t('service.deliveries.cod.payDescription', { amount: money(paying.net_amount), name: paying.customer?.name }) : ''} submitText={t('service.deliveries.cod.markPaid')} loading={payRemittance.isPending} onSubmit={() => payRemittance.mutate({ id: paying.id, externalRef: reference || undefined }, { onSuccess: () => { toast.success(t('service.deliveries.done.remittancePaid')); setPaying(null) } })}>
        <Input dir="ltr" label={t('service.billing.fields.reference')} value={reference} onChange={(event) => setReference(event.target.value)} />
      </FormDialog>
    </div>
  )
}
