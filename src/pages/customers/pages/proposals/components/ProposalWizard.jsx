import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { UserRound } from 'lucide-react'
import { toast } from 'sonner'

import { useCustomers } from '../../../../../features/customers/hooks/useCustomers'
import { useProposalMutations, useProposalTemplates, useProposalTemplateInfo } from '../../../../../features/proposals'
import { useUsers } from '../../../../../features/users/hooks/useUsers'
import { Button } from '../../../../../shared/components/ui/Button'
import { Input } from '../../../../../shared/components/ui/Input'
import { Select } from '../../../../../shared/components/ui/Select'
import { CURRENCY_OPTIONS } from '../constants/proposalBuilderDefaults'
import { buildVersionPayload } from '../utils/proposalBuilderContent'
import { extractCustomersFromInfinite, getCustomerName, getResponseEntity } from '../utils/proposalPayloads'
import { ProposalModal } from './ProposalModal'
import { createProposalContentFromTemplate, getCurrentTemplateVersion } from '../utils/templateVersionSnapshot'

function defaultExpiryDate() {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString().slice(0, 10)
}

export function ProposalWizard({ open, onClose }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    customer_id: '',
    template_id: searchParams.get('template_id') || '',
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
  const selectedTemplateQuery = useProposalTemplateInfo(form.template_id, undefined, { enabled: Boolean(open && form.template_id) })
  const mutations = useProposalMutations()

  const customers = extractCustomersFromInfinite(customersQuery.data)
  const templates = templatesQuery.data || []
  const users = usersQuery.data || []

  const selectedCustomer = useMemo(() => (
    customers.find((customer) => String(customer.id) === String(form.customer_id))
  ), [customers, form.customer_id])

  const currentTemplateVersion = getCurrentTemplateVersion(selectedTemplateQuery.data)

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

  const handleCreate = async () => {
    if (mutations.createProposal.isPending || mutations.createProposalVersion.isPending) return
    if (!form.customer_id || !form.template_id || !form.title.trim()) {
      toast.error(t('proposals.wizard.chooseCustomerFirst'))
      return
    }
    if (!selectedCustomer) {
      toast.error(t('proposals.wizard.chooseCustomerFirst'))
      return
    }

    if (!currentTemplateVersion || !createProposalContentFromTemplate(currentTemplateVersion, { title: form.title }, selectedCustomer, t)) {
      toast.error(t('proposals.templateEditor.selectPublishedVersion'))
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

    const visualContent = createProposalContentFromTemplate(currentTemplateVersion, { ...createdProposal, ...payload }, selectedCustomer, t)
    await mutations.createProposalVersion.mutateAsync({
      proposalId: createdProposalId,
      payload: buildVersionPayload(null, { ...createdProposal, ...payload }, visualContent, {
        name: 'Version 1',
        change_note: t('proposals.templateEditor.createdFromTemplate'),
        template_id: Number(form.template_id) || undefined,
        is_current: true,
      }),
    })

    toast.success(t('proposals.wizard.createdSuccess'))
    onClose()
    navigate(`/LeadsCenter/proposals/${createdProposalId}/builder`)
  }

  const isSubmitting = mutations.createProposal.isPending || mutations.createProposalVersion.isPending
  const canCreate = Boolean(form.customer_id && form.template_id && form.title.trim() && currentTemplateVersion && !selectedTemplateQuery.isLoading)

  const footer = (
    <div className="flex items-center justify-end gap-3">
      <Button variant="ghost" disabled={isSubmitting} onClick={onClose}>{t('customers.table.cancel')}</Button>
      <Button onClick={handleCreate} disabled={!canCreate || isSubmitting} loading={isSubmitting}>
        {t('proposals.wizard.createAndOpenBuilder')}
      </Button>
    </div>
  )

  return (
    <ProposalModal open={open} onClose={onClose} title={t('proposals.wizard.modalTitle')} footer={footer}>
      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label={t('proposals.wizard.chooseCustomerLabel')}
          value={form.customer_id}
          onChange={(value) => updateForm('customer_id', value)}
          options={customers.map(customer => ({
            value: String(customer.id),
            label: `${getCustomerName(customer, t)} - ${customer.phone || customer.email || customer.id}`,
          }))}
          placeholder={customersQuery.isLoading ? t('proposals.wizard.loadingCustomers') : t('proposals.wizard.chooseCustomerPlaceholder')}
        />
        <Select
          label={t('proposals.wizard.steps.template')}
          value={form.template_id}
          onChange={(value) => updateForm('template_id', value)}
          options={templates.filter(template => template.is_active).map(template => ({
            value: String(template.id),
            label: template.name || `Template #${template.id}`,
          }))}
          placeholder={templatesQuery.isLoading ? t('proposals.wizard.loadingTemplates') : t('proposals.wizard.chooseTemplatePlaceholder')}
        />
        <Input label={t('proposals.builder.proposalTitle')} value={form.title} onChange={event => updateForm('title', event.target.value)} />
        <Input label={t('proposals.wizard.expiryDateLabel')} type="date" value={form.expires_at} onChange={event => updateForm('expires_at', event.target.value)} />
        <Select label={t('proposals.wizard.currencyLabel')} value={form.currency} onChange={value => updateForm('currency', value)} options={CURRENCY_OPTIONS} />
        <Select
          label={t('customers.table.assignedTo')}
          value={form.assigned_to}
          onChange={value => updateForm('assigned_to', value)}
          options={users.map(user => ({ value: String(user.id), label: user.name || user.email || `User #${user.id}` }))}
          placeholder={t('customers.followUp.optionalPlaceholder')}
        />
        <Input label={t('proposals.wizard.shortDescriptionLabel')} value={form.description} onChange={event => updateForm('description', event.target.value)} className="md:col-span-2" />
        {selectedCustomer && (
          <div className="md:col-span-2 flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] p-3 text-sm">
            <UserRound size={18} />
            <strong>{getCustomerName(selectedCustomer, t)}</strong>
            {[selectedCustomer.email, selectedCustomer.phone, selectedCustomer.company].filter(Boolean).map(value => <span key={value}>{value}</span>)}
          </div>
        )}
        {form.template_id && (
          <p role="status" className="md:col-span-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm">
            {selectedTemplateQuery.isLoading
              ? t('proposals.templateEditor.loading')
              : currentTemplateVersion
                ? t('proposals.templateEditor.usingVersion', { name: currentTemplateVersion.name || currentTemplateVersion.id })
                : t('proposals.templateEditor.selectPublishedVersion')}
          </p>
        )}
      </div>
    </ProposalModal>
  )
}
