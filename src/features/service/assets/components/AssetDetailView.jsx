import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRightLeft, ShieldCheck, ShieldOff } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { cn } from '../../../../shared/utils/cn'
import { formatDate } from '../../../../shared/utils/dateTime'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useServiceTerminology } from '../../core/capabilities/useServiceCapabilities'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { CaseStatusBadge } from '../../cases/components/CaseBadges'
import { EntitlementsList } from '../../entitlements/components/EntitlementsList'
import { CustomerSelect } from '../../records/components/CustomerSelect'
import { useAsset, useAssetMutations } from '../api/assetsApi'
import { AssetStatusBadge, WARRANTY_TONE } from './AssetStatusBadge'

const STATUSES = ['active', 'in_repair', 'replaced', 'retired', 'transferred']

function Section({ title, children, action }) {
  return (
    <section className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <header className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  )
}

/** Asset: ownership, warranties, entitlements, service history, transfers. */
export function AssetDetailView({ assetId, backTo, casePath = (id) => `/service/cases/${id}` }) {
  const { t, i18n } = useTranslation()
  const term = useServiceTerminology()
  const asset = useAsset(assetId)
  const { update, transfer, voidWarranty } = useAssetMutations()
  const [transferOpen, setTransferOpen] = useState(false)
  const [transferTo, setTransferTo] = useState({ to_customer_id: '', reason: '' })
  const [voiding, setVoiding] = useState(null)
  const [voidReason, setVoidReason] = useState('')
  const item = asset.data
  const language = i18n.language
  const date = (value) => (value ? formatDate(value, language, { dateStyle: 'medium' }) : '—')
  const transferErrors = getServiceFieldErrors(transfer.error)

  return (
    <div className="grid gap-4">
      <Link to={backTo} className="inline-flex w-fit items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
        <ArrowLeft size={16} aria-hidden="true" className="rtl:-scale-x-100" />
        {t('service.assets.back')}
      </Link>
      <ResourceState isLoading={asset.isLoading} error={asset.error} onRetry={asset.refetch}>
        {item && (
          <>
            <header className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="grid gap-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span dir="ltr" className="font-mono">{item.serial_number || '—'}</span>
                  <AssetStatusBadge status={item.status} />
                  <span className={cn('font-medium', WARRANTY_TONE[item.warranty_status])}>{item.warranty ? t('service.assets.warrantyUntil', { date: date(item.warranty.ends_at) }) : t(`service.assets.warrantyStatus.${item.warranty_status}`)}</span>
                </div>
                <h1 className="text-lg font-bold text-[var(--text)]">{localizeLabel(item.name, language, item.id)}</h1>
                <p className="text-sm text-[var(--text-muted)]">{term('customer')}: {item.customer?.name}</p>
              </div>
              <div className="flex items-end gap-2">
                <div className="w-44">
                  <Select label={t('service.assets.fields.status')} value={item.status} disabled={update.isPending} onChange={(status) => status && update.mutate({ id: item.id, version: item.version, status })} options={STATUSES.map((value) => ({ value, label: t(`service.assets.statuses.${value}`) }))} />
                </div>
                <Button variant="outline" onClick={() => { transfer.reset(); setTransferTo({ to_customer_id: '', reason: '' }); setTransferOpen(true) }}>
                  <ArrowRightLeft size={16} aria-hidden="true" />
                  {t('service.assets.transfer.button')}
                </Button>
              </div>
            </header>

            <div className="grid gap-4 lg:grid-cols-2">
              <Section title={t('service.assets.details')}>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-xs text-[var(--text-muted)]">{t('service.assets.fields.model')}</dt><dd dir="ltr" className="text-start text-[var(--text)]">{item.model_number || '—'}</dd></div>
                  <div><dt className="text-xs text-[var(--text-muted)]">{t('service.assets.fields.purchase')}</dt><dd className="text-[var(--text)]">{date(item.purchase_date)}</dd></div>
                  <div><dt className="text-xs text-[var(--text-muted)]">{t('service.assets.fields.installation')}</dt><dd className="text-[var(--text)]">{date(item.installation_date)}</dd></div>
                  <div><dt className="text-xs text-[var(--text-muted)]">{t('service.assets.fields.location')}</dt><dd className="text-[var(--text)]">{item.location?.address || '—'}</dd></div>
                </dl>
              </Section>

              <Section title={t('service.assets.warranties')}>
                <ul className="grid gap-2">
                  {item.warranties.map((warranty) => (
                    <li key={warranty.id} className="flex items-start gap-3 rounded-md border border-[var(--border)] p-3">
                      {warranty.status === 'active' ? <ShieldCheck size={18} className="mt-0.5 text-sla-on-track" aria-hidden="true" /> : <ShieldOff size={18} className="mt-0.5 text-[var(--text-muted)]" aria-hidden="true" />}
                      <div className="grid flex-1 gap-0.5 text-sm">
                        <span className="font-medium text-[var(--text)]">{t(`service.assets.warrantyTypes.${warranty.type}`)} · <span className={WARRANTY_TONE[warranty.status]}>{t(`service.assets.warrantyStatus.${warranty.status}`)}</span></span>
                        <span className="text-xs text-[var(--text-muted)]">{t('service.entitlements.range', { from: date(warranty.starts_at), to: date(warranty.ends_at) })}</span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {[warranty.coverage?.parts && t('service.capabilities.options.parts'), warranty.coverage?.labor && t('service.capabilities.options.labor')].filter(Boolean).join(' · ')}
                          {warranty.coverage?.exclusions ? ` — ${t('service.assets.exclusions')}: ${localizeLabel(warranty.coverage.exclusions, language, '')}` : ''}
                        </span>
                      </div>
                      {warranty.status === 'active' && (
                        <Button variant="ghost" size="sm" onClick={() => { setVoidReason(''); setVoiding(warranty) }}>{t('service.assets.voidWarranty')}</Button>
                      )}
                    </li>
                  ))}
                  {!item.warranties.length && <li className="text-xs text-[var(--text-muted)]">{t('service.assets.noWarranty')}</li>}
                </ul>
              </Section>
            </div>

            <Section title={t('service.hub.entitlements')}>
              <EntitlementsList params={{ asset_id: item.id }} showCustomer={false} />
            </Section>

            <Section title={t('service.assets.history')}>
              {!item.service_history.length && <p className="text-xs text-[var(--text-muted)]">{t('service.assets.noHistory')}</p>}
              <ul className="divide-y divide-[var(--border)]">
                {item.service_history.map((entry) => (
                  <li key={`${entry.source_type}-${entry.id}`} className="flex flex-wrap items-center gap-3 py-2 text-sm">
                    <Link to={casePath(entry.id)} dir="ltr" className="font-mono text-xs text-[var(--text-muted)] hover:underline">{entry.reference}</Link>
                    <span className="flex-1 text-[var(--text)]">{entry.title}</span>
                    <CaseStatusBadge status={entry.status} />
                    <span className="text-xs text-[var(--text-muted)]">{date(entry.occurred_at)}</span>
                  </li>
                ))}
              </ul>
              {item.transfers?.length > 0 && (
                <div className="grid gap-1 border-t border-[var(--border)] pt-3">
                  <h3 className="text-xs font-semibold text-[var(--text-muted)]">{t('service.assets.transfers')}</h3>
                  {item.transfers.map((entry, index) => (
                    <p key={index} className="text-xs text-[var(--text)]">{t('service.assets.transferLine', { from: entry.from?.name, to: entry.to?.name, date: date(entry.at), by: entry.by })}</p>
                  ))}
                </div>
              )}
            </Section>

            <FormDialog open={transferOpen} onClose={() => setTransferOpen(false)} title={t('service.assets.transfer.title')} description={t('service.assets.transfer.description')} submitText={t('service.assets.transfer.button')} loading={transfer.isPending} onSubmit={() => transfer.mutate({ id: item.id, ...transferTo }, { onSuccess: () => setTransferOpen(false) })}>
              <CustomerSelect value={transferTo.to_customer_id} onChange={(value) => setTransferTo((current) => ({ ...current, to_customer_id: value }))} error={transferErrors.to_customer_id && t(`service.settings.validation.${transferErrors.to_customer_id[0]}`)} />
              <Input label={t('service.entitlements.reason')} dir="auto" value={transferTo.reason} onChange={(event) => setTransferTo((current) => ({ ...current, reason: event.target.value }))} />
            </FormDialog>
            <FormDialog open={Boolean(voiding)} onClose={() => setVoiding(null)} title={t('service.assets.voidWarranty')} description={t('service.assets.voidDescription')} submitText={t('service.assets.voidWarranty')} submitDisabled={!voidReason.trim()} loading={voidWarranty.isPending} onSubmit={() => voidWarranty.mutate({ id: voiding.id, reason: voidReason }, { onSuccess: () => { setVoiding(null); asset.refetch() } })}>
              <Input label={t('service.entitlements.reason')} dir="auto" value={voidReason} onChange={(event) => setVoidReason(event.target.value)} />
            </FormDialog>
          </>
        )}
      </ResourceState>
    </div>
  )
}
