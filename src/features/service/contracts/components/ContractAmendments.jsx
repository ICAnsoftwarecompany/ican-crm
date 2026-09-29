import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { formatDate } from '../../../../shared/utils/dateTime'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { useCatalogItems } from '../../catalog/api/catalogApi'
import { useContractMutations } from '../api/contractsApi'
import { ContractLinesField } from './ContractLinesField'

const AMENDABLE = ['signed', 'active', 'expiring']

/** Amendments after signing: only the difference is applied (and handed off). */
export function ContractAmendments({ contract }) {
  const { t, i18n } = useTranslation()
  const catalog = useCatalogItems({})
  const { action, signAmendment } = useContractMutations(contract.id)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ summary: '', lines: [], end_date: '' })
  const errors = getServiceFieldErrors(action.error)
  const date = (value) => (value ? formatDate(value, i18n.language, { dateStyle: 'medium' }) : '—')

  const submit = () =>
    action.mutate(
      {
        id: contract.id,
        action: 'amendments',
        version: contract.version,
        summary: form.summary,
        changes: { add_items: form.lines.map((line) => ({ ...line, quantity: Number(line.quantity), unit_price: Number(line.unit_price), discount: Number(line.discount) || 0 })), end_date: form.end_date ? new Date(form.end_date).toISOString() : undefined },
      },
      { onSuccess: () => setOpen(false) }
    )

  return (
    <section className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <header className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--text)]">{t('service.contracts.amendments')}</h2>
        {AMENDABLE.includes(contract.status) && (
          <Button size="sm" variant="outline" onClick={() => { setForm({ summary: '', lines: [], end_date: '' }); action.reset(); setOpen(true) }}>
            <Plus size={14} aria-hidden="true" />
            {t('service.contracts.newAmendment')}
          </Button>
        )}
      </header>
      {!contract.amendments.length && <p className="text-xs text-[var(--text-muted)]">{t('service.contracts.noAmendments')}</p>}
      <ul className="divide-y divide-[var(--border)]">
        {contract.amendments.map((amendment) => (
          <li key={amendment.id} className="flex flex-wrap items-center gap-3 py-2 text-sm">
            <span className="text-xs text-[var(--text-muted)]" dir="ltr">#{amendment.number}</span>
            <span className="flex-1 text-[var(--text)]"><bdi>{localizeLabel(amendment.summary, i18n.language, '')}</bdi></span>
            <span className="text-xs text-[var(--text-muted)]">{t('service.contracts.effective', { date: date(amendment.effective_date) })}</span>
            {amendment.status === 'signed' ? (
              <span className="text-xs font-medium text-sla-on-track">{t('service.contracts.amendmentSigned')}</span>
            ) : (
              <Button size="sm" loading={signAmendment.isPending} onClick={() => signAmendment.mutate({ id: contract.id, amendmentId: amendment.id }, { onSuccess: () => toast.success(t('service.contracts.done.amendment')) })}>
                {t('service.contracts.signAmendment')}
              </Button>
            )}
          </li>
        ))}
      </ul>
      <FormDialog open={open} onClose={() => setOpen(false)} size="lg" className="max-w-2xl" title={t('service.contracts.newAmendment')} description={t('service.contracts.amendmentDescription')} submitText={t('service.contracts.create.submit')} loading={action.isPending} onSubmit={submit}>
        <Input label={t('service.contracts.amendmentSummary')} dir="auto" value={form.summary} error={errors.summary && t('service.settings.validation.required')} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} />
        <ContractLinesField lines={form.lines} onChange={(lines) => setForm((current) => ({ ...current, lines }))} items={catalog.data || []} error={errors.changes && t('service.contracts.amendmentNeedsChange')} />
        <Input type="date" dir="ltr" label={t('service.contracts.newEndDate')} value={form.end_date} onChange={(event) => setForm((current) => ({ ...current, end_date: event.target.value }))} />
      </FormDialog>
    </section>
  )
}
