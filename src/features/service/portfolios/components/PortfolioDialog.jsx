import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { useCaseSetup } from '../../cases/hooks/useCases'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { usePortfolioMutations } from '../api/portfoliosApi'

const EMPTY = { name: { ar: '', en: '' }, owner_ids: [], criteria: { city: '', tier: '' }, status: 'active' }

/** Create / edit a portfolio: name, owners (the staff who hold its customers) and descriptive criteria. */
export function PortfolioDialog({ open, portfolio, onClose }) {
  const { t } = useTranslation()
  const setup = useCaseSetup()
  const { create, update } = usePortfolioMutations()
  const mutation = portfolio ? update : create
  const [form, setForm] = useState(EMPTY)
  const errors = getServiceFieldErrors(mutation.error)
  useEffect(() => {
    if (open) {
      setForm(portfolio ? { name: portfolio.name, owner_ids: portfolio.owner_ids || [], criteria: { city: portfolio.criteria?.city || '', tier: portfolio.criteria?.tier || '' }, status: portfolio.status } : EMPTY)
      mutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, portfolio?.id])
  const setName = (lang) => (event) => setForm((current) => ({ ...current, name: { ...current.name, [lang]: event.target.value } }))
  const setCriteria = (key) => (event) => setForm((current) => ({ ...current, criteria: { ...current.criteria, [key]: event.target.value } }))
  const toggleOwner = (id) => setForm((current) => ({ ...current, owner_ids: current.owner_ids.includes(id) ? current.owner_ids.filter((entry) => entry !== id) : [...current.owner_ids, id] }))
  const submit = () => {
    const criteria = Object.fromEntries(Object.entries(form.criteria).filter(([, value]) => String(value).trim()))
    mutation.mutate({ ...(portfolio && { id: portfolio.id }), ...form, criteria }, { onSuccess: () => { toast.success(t(portfolio ? 'service.portfolios.done.updated' : 'service.portfolios.done.created')); onClose() } })
  }
  return (
    <FormDialog open={open} onClose={onClose} size="lg" className="max-w-2xl" title={t(portfolio ? 'service.portfolios.edit' : 'service.portfolios.create')} submitText={t('service.settings.actions.save')} loading={mutation.isPending} onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label={t('service.portfolios.fields.nameAr')} lang="ar" dir="auto" value={form.name?.ar || ''} onChange={setName('ar')} error={errors.name && t('service.settings.validation.required')} />
        <Input label={t('service.portfolios.fields.nameEn')} lang="en" dir="ltr" value={form.name?.en || ''} onChange={setName('en')} />
        <Input label={t('service.portfolios.fields.city')} dir="auto" value={form.criteria.city} onChange={setCriteria('city')} />
        <Input label={t('service.portfolios.fields.tier')} dir="auto" value={form.criteria.tier} onChange={setCriteria('tier')} />
      </div>
      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-medium text-[var(--text)]">{t('service.portfolios.fields.owners')}</legend>
        <div className="flex flex-wrap gap-2">
          {(setup.data?.agents || []).map((agent) => (
            <label key={agent.id} className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2 py-1 text-sm text-[var(--text)]">
              <input type="checkbox" checked={form.owner_ids.includes(agent.id)} onChange={() => toggleOwner(agent.id)} />
              {agent.name}
            </label>
          ))}
        </div>
        {errors.owner_ids && <p className="text-xs text-status-lost">{t('service.portfolios.validation.owners')}</p>}
      </fieldset>
    </FormDialog>
  )
}
