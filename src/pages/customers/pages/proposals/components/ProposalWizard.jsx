import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, FileSignature, UserRound } from 'lucide-react'
import { toast } from 'sonner'

import { useCustomers } from '../../../../../features/customers/hooks/useCustomers'
import { useProposalMutations, useProposalTemplates } from '../../../../../features/proposals'
import { useUsers } from '../../../../../features/users/hooks/useUsers'
import { Button } from '../../../../../shared/components/ui/Button'
import { Input } from '../../../../../shared/components/ui/Input'
import { Select } from '../../../../../shared/components/ui/Select'
import { CURRENCY_OPTIONS } from '../constants/proposalBuilderDefaults'
import { buildVersionPayload, createDefaultBuilderContent } from '../utils/proposalBuilderContent'
import { extractCustomersFromInfinite, getCustomerName, getResponseEntity } from '../utils/proposalPayloads'
import { ProposalModal } from './ProposalModal'

function defaultExpiryDate() {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString().slice(0, 10)
}

function getWizardSteps(t) {
  return [
    { id: 'customer', label: t('proposals.wizard.steps.customer') },
    { id: 'template', label: t('proposals.wizard.steps.template') },
    { id: 'review', label: t('proposals.wizard.steps.review') },
  ]
}

export function ProposalWizard({ open, onClose }) {
  const { t } = useTranslation()
  const STEPS = useMemo(() => getWizardSteps(t), [t])
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)
  const [form, setForm] = useState({
    customer_id: '',
    template_id: '',
    assigned_to: '',
    title: '',
    description: '',
    currency: 'egp',
    expires_at: defaultExpiryDate(),
    priority: 'normal',
  })

  const customersQuery = useCustomers({ per_page: 60 })
  const templatesQuery = useProposalTemplates()
  const usersQuery = useUsers()
  const mutations = useProposalMutations()

  const customers = extractCustomersFromInfinite(customersQuery.data)
  const templates = templatesQuery.data || []
  const users = usersQuery.data || []

  const selectedCustomer = useMemo(() => (
    customers.find((customer) => String(customer.id) === String(form.customer_id))
  ), [customers, form.customer_id])

  const selectedTemplate = useMemo(() => (
    templates.find((template) => String(template.id) === String(form.template_id))
  ), [templates, form.template_id])

  const updateForm = (key, value) => {
    setForm((current) => {
      const next = { ...current, [key]: value }
      if (key === 'customer_id') {
        const customer = customers.find((item) => String(item.id) === String(value))
        if (customer && !current.title) next.title = t('proposals.wizard.newProposalTitleFor', { name: getCustomerName(customer, t) })
      }
      return next
    })
  }

  const canMoveNext = () => {
    if (STEPS[stepIndex].id === 'customer') return Boolean(form.customer_id && form.title.trim())
    if (STEPS[stepIndex].id === 'template') return Boolean(form.template_id)
    return true
  }

  const handleCreate = async () => {
    if (!selectedCustomer) {
      toast.error(t('proposals.wizard.chooseCustomerFirst'))
      return
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      template_id: Number(form.template_id) || undefined,
      assigned_to: Number(form.assigned_to) || undefined,
      currency: form.currency,
      expires_at: form.expires_at || undefined,
      metadata: {
        customer_id: selectedCustomer.id,
        customer_name: getCustomerName(selectedCustomer, t),
        customer_email: selectedCustomer.email || '',
        customer_phone: selectedCustomer.phone || '',
        company: selectedCustomer.company || '',
        priority: form.priority,
        source: 'crm_proposal_wizard',
      },
    }

    const createdResponse = await mutations.createProposal.mutateAsync(payload)
    const createdProposal = getResponseEntity(createdResponse)
    const createdProposalId = createdProposal?.id
    if (!createdProposalId) {
      toast.success(t('proposals.wizard.createdNoIdWarning'))
      onClose()
      return
    }

    const visualContent = createDefaultBuilderContent({ ...createdProposal, ...payload }, selectedCustomer, t)
    await mutations.createProposalVersion.mutateAsync({
      proposalId: createdProposalId,
      payload: buildVersionPayload(null, { ...createdProposal, ...payload }, visualContent, {
        name: 'Version 1',
        change_note: 'Created from visual wizard',
        template_id: Number(form.template_id) || undefined,
        is_current: true,
      }),
    })

    toast.success(t('proposals.wizard.createdSuccess'))
    onClose()
    navigate(`/LeadsCenter/proposals/${createdProposalId}/builder`)
  }

  const footer = (
    <div className="flex items-center justify-between gap-3">
      <Button variant="ghost" onClick={() => (stepIndex === 0 ? onClose() : setStepIndex((index) => index - 1))}>
        {stepIndex === 0 ? t('customers.table.cancel') : t('proposals.wizard.previous')}
      </Button>
      {stepIndex < STEPS.length - 1 ? (
        <Button disabled={!canMoveNext()} onClick={() => setStepIndex((index) => index + 1)}>
          {t('proposals.wizard.next')}
        </Button>
      ) : (
        <Button onClick={handleCreate} loading={mutations.createProposal.isPending || mutations.createProposalVersion.isPending}>
          {t('proposals.wizard.createAndOpenBuilder')}
        </Button>
      )}
    </div>
  )

  return (
    <ProposalModal open={open} onClose={onClose} title={t('proposals.wizard.modalTitle')} footer={footer}>
      <div className="mb-6 grid grid-cols-3 gap-2">
        {STEPS.map((step, index) => (
          <div key={step.id} className={`rounded-lg border px-3 py-2 text-center text-xs font-black ${index <= stepIndex ? 'border-[#00C2CB] bg-[#E8F9FA] text-[#007A80]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>
            {step.label}
          </div>
        ))}
      </div>

      {STEPS[stepIndex].id === 'customer' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label={t('proposals.wizard.chooseCustomerLabel')}
            value={form.customer_id}
            onChange={(value) => updateForm('customer_id', value)}
            options={customers.map((customer) => ({ value: String(customer.id), label: `${getCustomerName(customer, t)} - ${customer.phone || customer.email || customer.id}` }))}
            placeholder={customersQuery.isLoading ? t('proposals.wizard.loadingCustomers') : t('proposals.wizard.chooseCustomerPlaceholder')}
          />
          <Input label={t('proposals.builder.proposalTitle')} value={form.title} onChange={(event) => updateForm('title', event.target.value)} />
          <Input label={t('proposals.wizard.shortDescriptionLabel')} value={form.description} onChange={(event) => updateForm('description', event.target.value)} className="md:col-span-2" />
          {selectedCustomer ? (
            <div className="md:col-span-2 rounded-lg border border-[#DCE8F3] bg-[#F8FAFC] p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-black text-[#162847]">
                <UserRound size={18} />
                {getCustomerName(selectedCustomer, t)}
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                {[selectedCustomer.email, selectedCustomer.phone, selectedCustomer.company].filter(Boolean).map((value) => <span key={value}>{value}</span>)}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {STEPS[stepIndex].id === 'template' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label={t('proposals.wizard.steps.template')}
            value={form.template_id}
            onChange={(value) => updateForm('template_id', value)}
            options={templates.map((template) => ({ value: String(template.id), label: template.name || `Template #${template.id}` }))}
            placeholder={templatesQuery.isLoading ? t('proposals.wizard.loadingTemplates') : t('proposals.wizard.chooseTemplatePlaceholder')}
          />
          <Select
            label={t('customers.table.assignedTo')}
            value={form.assigned_to}
            onChange={(value) => updateForm('assigned_to', value)}
            options={users.map((user) => ({ value: String(user.id), label: user.name || user.email || `User #${user.id}` }))}
            placeholder={t('customers.followUp.optionalPlaceholder')}
          />
          <Select label={t('proposals.wizard.currencyLabel')} value={form.currency} onChange={(value) => updateForm('currency', value)} options={CURRENCY_OPTIONS} />
          <Input label={t('proposals.wizard.expiryDateLabel')} type="date" value={form.expires_at} onChange={(event) => updateForm('expires_at', event.target.value)} />
        </div>
      ) : null}

      {STEPS[stepIndex].id === 'review' ? (
        <div className="rounded-xl border border-[#DCE8F3] bg-[#F8FAFC] p-5">
          <div className="mb-4 flex items-center gap-2 text-base font-black text-[#162847]">
            <FileSignature size={20} />
            {t('proposals.wizard.reviewBeforeCreate')}
          </div>
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <div><span className="font-black">{t('proposals.builder.fields.title')}:</span> {form.title}</div>
            <div><span className="font-black">{t('proposals.wizard.steps.customer')}:</span> {selectedCustomer ? getCustomerName(selectedCustomer, t) : '-'}</div>
            <div><span className="font-black">{t('proposals.wizard.steps.template')}:</span> {selectedTemplate?.name || '-'}</div>
            <div><span className="font-black">{t('proposals.wizard.currencyLabel')}:</span> {form.currency}</div>
            <div><span className="font-black">{t('proposals.wizard.expiryDateLabel')}:</span> {form.expires_at || '-'}</div>
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#047857]">
            <CheckCircle2 size={16} />
            {t('proposals.wizard.willCreateEditableVersion')}
          </div>
        </div>
      ) : null}
    </ProposalModal>
  )
}
