import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { getServiceErrorMessage, getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { useServiceTerminology } from '../../core/capabilities/useServiceCapabilities'
import { CASE_PRIORITIES } from '../constants/caseViews'
import { useCaseMutations, useCaseSetup, useCustomerLookup } from '../hooks/useCases'

const TEXTAREA_CLASS =
  'min-h-[88px] w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-brand-accent'

const emptyForm = (defaults = {}) => ({
  customer_id: defaults.customer?.id || '',
  subject: defaults.subject || '',
  description: defaults.description || '',
  type_id: '',
  priority: '',
  queue_id: '',
})

/**
 * Create a case. `defaults` pre-fills it (e.g. from a conversation:
 * { customer, subject, source_channel, conversation_id }).
 */
export function CaseCreateDialog({ open, onClose, defaults, navigateOnCreate = true, onCreated }) {
  const { t, i18n } = useTranslation()
  const term = useServiceTerminology()
  const navigate = useNavigate()
  const { data: setup } = useCaseSetup()
  const { create } = useCaseMutations()
  const [form, setForm] = useState(() => emptyForm(defaults))
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const customers = useCustomerLookup(debouncedSearch)
  const fieldErrors = getServiceFieldErrors(create.error)
  const language = i18n.language

  useEffect(() => {
    if (open) {
      setForm(emptyForm(defaults))
      setSearch('')
      create.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const customerOptions = useMemo(() => {
    const list = customers.data || []
    const withDefault = defaults?.customer && !list.some((item) => item.id === defaults.customer.id) ? [defaults.customer, ...list] : list
    return withDefault.map((item) => ({ value: item.id, label: item.phone ? `${item.name} · ${item.phone}` : item.name }))
  }, [customers.data, defaults])

  const typeOptions = (setup?.case_types || []).map((type) => ({ value: type.id, label: localizeLabel(type.label, language, type.key) }))
  const queueOptions = (setup?.queues || []).map((queue) => ({ value: queue.id, label: localizeLabel(queue.label, language, queue.key) }))
  const priorityOptions = CASE_PRIORITIES.map((value) => ({ value, label: t(`service.cases.priority.${value}`) }))
  const update = (field) => (value) => setForm((current) => ({ ...current, [field]: value }))
  const required = t('service.cases.validation.required')

  const submit = () => {
    const payload = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== ''))
    create.mutate(
      { ...payload, source_channel: defaults?.source_channel, conversation_id: defaults?.conversation_id },
      {
        onSuccess: (created) => {
          toast.success(t('service.cases.create.done', { number: created.case_number }))
          onCreated?.(created)
          onClose()
          if (navigateOnCreate) navigate(`/service/cases/${created.id}`)
        },
        onError: (error) => {
          if (error?.response?.status !== 422) toast.error(getServiceErrorMessage(error, t))
        },
      }
    )
  }

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      size="lg"
      title={t('service.cases.create.title', { entity: term('case') })}
      description={t('service.cases.create.description')}
      submitText={t('service.cases.create.submit')}
      loading={create.isPending}
      submitDisabled={!form.customer_id || !form.subject.trim() || !form.type_id}
      onSubmit={submit}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label={t('service.cases.create.findCustomer', { entity: term('customer') })}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('service.cases.create.searchPlaceholder')}
        />
        <Select
          label={term('customer')}
          options={customerOptions}
          value={form.customer_id}
          onChange={update('customer_id')}
          error={fieldErrors.customer_id && required}
        />
      </div>
      <Input
        label={t('service.cases.fields.subject')}
        value={form.subject}
        onChange={(event) => update('subject')(event.target.value)}
        error={fieldErrors.subject && required}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Select label={t('service.cases.fields.type')} options={typeOptions} value={form.type_id} onChange={update('type_id')} error={fieldErrors.type_id && required} />
        <Select
          label={t('service.cases.fields.priority')}
          options={priorityOptions}
          value={form.priority}
          onChange={update('priority')}
          placeholder={t('service.cases.create.priorityDefault')}
        />
        <Select label={t('service.cases.fields.queue')} options={queueOptions} value={form.queue_id} onChange={update('queue_id')} />
      </div>
      <label className="grid gap-1.5 text-sm font-medium text-[var(--text)]">
        {t('service.cases.fields.description')}
        <textarea className={TEXTAREA_CLASS} value={form.description} onChange={(event) => update('description')(event.target.value)} />
      </label>
    </FormDialog>
  )
}
