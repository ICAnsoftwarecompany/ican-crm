import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, UserRound, Trash2 } from 'lucide-react'
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
import { createProposalContentFromTemplate, getTemplateVersions, getCurrentTemplateVersion, getTemplateVersionContent } from '../utils/templateVersionSnapshot'

function defaultExpiryDate() {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString().slice(0, 10)
}

export function ProposalWizard({ open, onClose, initialCustomer = null }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [recipients, setRecipients] = useState(() => initialCustomer?.id || initialCustomer?.customer_id || searchParams.get('customer_id') ? [{ customer_id: String(initialCustomer?.id ?? initialCustomer?.customer_id ?? searchParams.get('customer_id')), name: initialCustomer?.name || initialCustomer?.full_name || '', email: initialCustomer?.email || '', role: '', is_primary: true, can_view: true, can_accept: true, can_sign: false, signature_required: false }] : [])
  const [minimumSignatures, setMinimumSignatures] = useState(1)
  const [clientName, setClientName] = useState('')
  const [form, setForm] = useState({
    template_id: searchParams.get('template_id') || '',
    template_version_id: '',
    assigned_to: '',
    title: initialCustomer?.name ? t('proposals.wizard.newProposalTitleFor', { name: getCustomerName(initialCustomer, t) }) : '',
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

  const loadedCustomers = extractCustomersFromInfinite(customersQuery.data)
  const customers = initialCustomer?.id != null && !loadedCustomers.some(customer => String(customer.id) === String(initialCustomer.id)) ? [initialCustomer, ...loadedCustomers] : loadedCustomers
  const templates = templatesQuery.data || []
  const users = usersQuery.data || []

  const selectedCustomer = useMemo(() => (
    customers.find((customer) => String(customer.id) === String(recipients[0]?.customer_id))
  ), [customers, recipients])

  const availableTemplateVersions = getTemplateVersions(selectedTemplateQuery.data).filter(version => {
    const content = getTemplateVersionContent(version)
    return Array.isArray(content?.sections) && content.sections.length > 0
  })
  const currentTemplateVersion = getCurrentTemplateVersion(selectedTemplateQuery.data)
  const selectedTemplateVersion = availableTemplateVersions.find(version => String(version.id) === String(form.template_version_id)) || (!form.template_version_id ? availableTemplateVersions.find(version => String(version.id) === String(currentTemplateVersion?.id)) : null)
  const selectedTemplate = templates.find(template => String(template.id) === String(form.template_id))

  const updateForm = (key, value) => {
    setForm((current) => {
      const next = { ...current, [key]: value }
      if (key === 'template_id') next.template_version_id = ''
      return next
    })
  }

  const handleCreate = async () => {
    if (mutations.createProposal.isPending || mutations.createProposalVersion.isPending || mutations.createProposalRecipients.isPending) return
    if (!form.template_id || !form.title.trim()) {
      toast.error('عنوان العرض والقالب مطلوبان')
      return
    }

    if (!selectedTemplateVersion || !createProposalContentFromTemplate(selectedTemplateVersion, { title: form.title }, selectedCustomer, t)) {
      toast.error(t('proposals.templateEditor.selectPublishedVersion'))
      return
    }

    const resolvedRecipients = recipients.map((recipient, index) => ({
      ...recipient,
      customer_id: Number(recipient.customer_id),
      name: recipient.name.trim(),
      email: recipient.email.trim(),
      role: recipient.role.trim() || undefined,
      is_primary: index === 0,
      signature_sort_order: index + 1,
      signature_required: Boolean(recipient.can_sign && recipient.signature_required),
    }))
    if (resolvedRecipients.some(recipient => !recipient.customer_id || !recipient.name || !recipient.email)) {
      toast.error('اختر عميلًا صالحًا وتأكد من الاسم والبريد الإلكتروني لكل مستلم')
      return
    }
    if (new Set(resolvedRecipients.map(recipient => recipient.customer_id)).size !== resolvedRecipients.length) {
      toast.error('لا يمكن إضافة نفس العميل أكثر من مرة')
      return
    }
    const requiredSignatures = resolvedRecipients.filter(recipient => recipient.can_sign && recipient.signature_required).length
    if (requiredSignatures && (Number(minimumSignatures) < 1 || Number(minimumSignatures) > requiredSignatures)) {
      toast.error('الحد الأدنى للتوقيعات لا يمكن أن يزيد عن عدد المستلمين المطلوب توقيعهم')
      return
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      template_id: Number(form.template_id) || undefined,
      assigned_to: Number(form.assigned_to) || undefined,
      currency: form.currency,
      expires_at: form.expires_at || undefined,
      minimum_required_signatures: requiredSignatures ? Number(minimumSignatures) : 1,
      metadata: {
        ...(selectedCustomer ? {
          customer_id: selectedCustomer.id,
          customer_name: getCustomerName(selectedCustomer, t),
          customer_email: selectedCustomer.email || '',
          customer_phone: selectedCustomer.phone || '',
          company: selectedCustomer.company || '',
        } : {}),
        client_name: clientName.trim() || (selectedCustomer ? getCustomerName(selectedCustomer, t) : ''),
        priority: form.priority,
        source: 'crm_proposal_wizard',
        source_template_id: Number(form.template_id),
        source_template_name: selectedTemplate?.name || selectedTemplateQuery.data?.name || '',
        source_template_version_id: selectedTemplateVersion.id,
        source_template_version_name: selectedTemplateVersion.name || `Version ${selectedTemplateVersion.version || 1}`,
        source_template_version_number: selectedTemplateVersion.version ?? null,
      },
    }

    let createdResponse
    try { createdResponse = await mutations.createProposal.mutateAsync(payload) }
    catch (error) { toast.error(error?.response?.data?.message || error?.message || 'تعذر إنشاء العرض'); return }
    const createdProposal = getResponseEntity(createdResponse)
    const createdProposalId = createdProposal?.id
    if (!createdProposalId) {
      toast.success(t('proposals.wizard.createdNoIdWarning'))
      onClose()
      return
    }

    if (resolvedRecipients.length) {
      try {
        await mutations.createProposalRecipients.mutateAsync({ proposal_id: createdProposalId, recipients: resolvedRecipients })
      } catch (error) {
        toast.error(`تم إنشاء العرض #${createdProposalId} لكن تعذر ربط المستلمين: ${error?.response?.data?.message || error?.message || 'خطأ غير معروف'}. راجع العرض قبل إعادة المحاولة.`, { duration: 12000 })
        onClose()
        navigate(`/LeadsCenter/proposals/${createdProposalId}/builder`)
        return
      }
    }

    const visualContent = createProposalContentFromTemplate(selectedTemplateVersion, { ...createdProposal, ...payload }, selectedCustomer, t)
    try { await mutations.createProposalVersion.mutateAsync({
      proposalId: createdProposalId,
      payload: buildVersionPayload(null, { ...createdProposal, ...payload }, visualContent, {
        name: 'Version 1',
        change_note: t('proposals.templateEditor.createdFromTemplate'),
        template_id: Number(form.template_id) || undefined,
        is_current: true,
      }),
    })

    } catch (error) {
      toast.error(`تم إنشاء العرض #${createdProposalId} لكن تعذر إنشاء إصدار التصميم: ${error?.response?.data?.message || error?.message || 'خطأ غير معروف'}`, { duration: 12000 })
      onClose()
      navigate(`/LeadsCenter/proposals/${createdProposalId}/builder`)
      return
    }

    toast.success(t('proposals.wizard.createdSuccess'))
    onClose()
    navigate(`/LeadsCenter/proposals/${createdProposalId}/builder`)
  }

  const isSubmitting = mutations.createProposal.isPending || mutations.createProposalVersion.isPending || mutations.createProposalRecipients.isPending
  const canCreate = Boolean(form.template_id && form.title.trim() && selectedTemplateVersion && !selectedTemplateQuery.isLoading)

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
        <div className="md:col-span-2 space-y-3 rounded-xl border border-[var(--border)] p-3">
          <div>
            <h3 className="text-sm font-black">مستلمو عرض السعر (اختياري)</h3>
            <p className="text-xs text-[var(--text-muted)]">يمكن إنشاء العرض دون عميل، أو إضافة أكثر من عميل مع صلاحيات مختلفة.</p>
          </div>
          <Input label="اسم الجهة / العميل الحر (اختياري)" value={clientName} onChange={event => setClientName(event.target.value)} />
          {recipients.map((recipient, index) => (
            <div key={index} className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
              <div className="flex items-center justify-between">
                <strong className="text-xs">مستلم {index + 1}{index === 0 ? ' — أساسي' : ''}</strong>
                <Button type="button" variant="ghost" size="sm" onClick={() => setRecipients(rows => rows.filter((_, i) => i !== index))}><Trash2 size={14} /> حذف</Button>
              </div>
              <Select label="العميل" value={recipient.customer_id} options={customers.map(customer => ({ value: String(customer.id), label: getCustomerName(customer, t) }))} placeholder="اختر العميل" onChange={value => {
                const customer = customers.find(item => String(item.id) === String(value))
                setRecipients(rows => rows.map((row, i) => i === index ? { ...row, customer_id: value, name: customer ? getCustomerName(customer, t) : '', email: customer?.email || '' } : row))
                      }} />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input label="الاسم" value={recipient.name} onChange={event => setRecipients(rows => rows.map((row, i) => i === index ? { ...row, name: event.target.value } : row))} />
                <Input label="البريد الإلكتروني" type="email" value={recipient.email} onChange={event => setRecipients(rows => rows.map((row, i) => i === index ? { ...row, email: event.target.value } : row))} />
              </div>
              <Input label="الدور (اختياري)" value={recipient.role} onChange={event => setRecipients(rows => rows.map((row, i) => i === index ? { ...row, role: event.target.value } : row))} />
              <div className="flex flex-wrap gap-3 text-xs">
                {[['can_view', 'عرض'], ['can_accept', 'موافقة'], ['can_sign', 'توقيع'], ['signature_required', 'التوقيع إلزامي']].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-1">
                    <input type="checkbox" checked={Boolean(recipient[key])} disabled={key === 'signature_required' && !recipient.can_sign} onChange={event => setRecipients(rows => rows.map((row, i) => i === index ? { ...row, [key]: event.target.checked, ...(key === 'can_sign' && !event.target.checked ? { signature_required: false } : {}) } : row))} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setRecipients(rows => [...rows, { customer_id: '', name: '', email: '', role: '', is_primary: false, can_view: true, can_accept: true, can_sign: false, signature_required: false }])}><Plus size={15} /> إضافة مستلم</Button>
          {recipients.some(recipient => recipient.signature_required) && <Input label="الحد الأدنى للتوقيعات المطلوبة" type="number" min="1" value={minimumSignatures} onChange={event => setMinimumSignatures(event.target.value)} />}
        </div>
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
        <div className="space-y-2 md:col-span-2">
          <Select
            label="إصدار القالب"
            value={form.template_version_id || String(selectedTemplateVersion?.id || '')}
            onChange={value => updateForm('template_version_id', value)}
            options={availableTemplateVersions.map(version => ({
              value: String(version.id),
              label: `${version.name || `Version ${version.version || version.id}`}${String(version.id) === String(currentTemplateVersion?.id) ? ' — الحالي' : ''}`,
            }))}
            placeholder={selectedTemplateQuery.isLoading ? 'جارٍ تحميل إصدارات القالب...' : 'اختر إصدار القالب'}
          />
          {form.template_id && !selectedTemplateQuery.isLoading && !availableTemplateVersions.length && (
            <p className="text-xs text-[var(--text-muted)]">لا توجد إصدارات محفوظة بتصميم صالح لهذا القالب.</p>
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => { onClose(); navigate('/LeadsCenter/proposals/templates/new') }}>
            <Plus size={16} /> إنشاء قالب جديد
          </Button>
        </div>
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
              : selectedTemplateVersion
                ? t('proposals.templateEditor.usingVersion', { name: selectedTemplateVersion.name || selectedTemplateVersion.id })
                : t('proposals.templateEditor.selectPublishedVersion')}
          </p>
        )}
      </div>
    </ProposalModal>
  )
}
