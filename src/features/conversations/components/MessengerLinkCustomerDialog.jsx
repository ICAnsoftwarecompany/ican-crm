import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BriefcaseBusiness, Check, Loader2, Plus, Search, Trash2, UserPlus, UsersRound, X } from 'lucide-react'
import { toast } from 'sonner'

import { useCustomerMutations, useCustomers } from '../../customers/hooks/useCustomers'
import { useStatuses, useTags } from '../../definitions/hooks/useDefinitions'
import { useProducts } from '../../products/hooks/useProducts'
import { useUsers } from '../../users/hooks/useUsers'
import { messengerApi } from '../api/messengerApi'
import { MESSENGER_CONVERSATIONS_QUERY_KEY, MESSENGER_CONVERSATION_INFO_QUERY_KEY } from '../utils/messengerConversations'
import { QUERY_KEYS } from '../../../shared/constants/queryKeys'
import { extractMessage } from '../../../shared/utils/apiResponse'
import { resolveTenantId } from '../../../services/tenantResolver'
import { useAuthStore } from '../../../store/authStore'

const initialForm = {
  name: '',
  phone: '',
  email: '',
  company: '',
  type: 'lead',
  status_type_id: '',
  lead_id: '',
  agent_id: '',
  tag_id: '',
  source: 'messenger',
  linked_type: 'automation',
  linked_by: '',
  link_date: new Date().toISOString().slice(0, 10),
  note: '',
}

const initialAttributes = [
  { key: 'budget', value: '' },
  { key: 'preferred_contact_time', value: '' },
]

const initialInteresteds = [
  { product_id: '', note: '', interest_level: 'medium' },
]

function flattenCustomersQueryData(data) {
  return (data?.pages || []).flatMap((page) => (Array.isArray(page?.data) ? page.data : []))
}

function getCreatedCustomer(response) {
  const data = response?.data ?? response
  if (Array.isArray(data)) return data[0] || null
  if (Array.isArray(data?.data)) return data.data[0] || null
  if (Array.isArray(data?.customers)) return data.customers[0] || null
  if (Array.isArray(data?.data?.data)) return data.data.data[0] || null
  if (Array.isArray(data?.data?.customers)) return data.data.customers[0] || null
  if (data?.id) return data
  if (data?.customer?.id) return data.customer
  return null
}

function normalizeText(value = '') {
  return String(value || '').trim().toLowerCase()
}

function normalizeNullableId(value) {
  const text = String(value ?? '').trim()
  if (!text) return null
  return /^\d+$/.test(text) ? Number(text) : text
}

function cleanText(value) {
  const text = String(value ?? '').trim()
  return text || null
}

function attributesRowsToObject(rows = []) {
  return rows.reduce((result, row) => {
    const key = String(row.key || '').trim()
    if (!key) return result
    result[key] = String(row.value ?? '').trim()
    return result
  }, {})
}

function interestRowsToPayload(rows = []) {
  return rows
    .map((row) => ({
      product_id: normalizeNullableId(row.product_id),
      note: cleanText(row.note),
      interest_level: row.interest_level || 'medium',
    }))
    .filter((row) => row.product_id)
}

function optionLabel(item, fallback = 'بدون اسم') {
  return item?.status || item?.tag || item?.name || item?.title || item?.username || item?.email || fallback
}

function getCustomerTypeMeta(customer = {}) {
  const isDeal = Number(customer.is_deal || 0) === 1
  if (isDeal) {
    return {
      label: 'Customer service',
      className: 'border-[#BBF7D0] bg-[#F0FDF4] text-[#047857]',
      icon: BriefcaseBusiness,
    }
  }

  return {
    label: customer.lead_type || 'Lead',
    className: 'border-[#FED7AA] bg-[#FFF7ED] text-[#C2410C]',
    icon: UsersRound,
  }
}

function buildDefaultForm(conversation) {
  const contact = conversation?.contact || {}
  const customer = conversation?.customer || {}
  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ').trim()
  const assignedUserId = conversation?.assigned_user?.id || conversation?.assignedUser?.id || customer.agent_id || ''

  return {
    ...initialForm,
    name: contact.name || fullName || customer.name || '',
    phone: contact.phone || customer.phone || '',
    email: contact.email || customer.email || '',
    company: customer.company || '',
    agent_id: assignedUserId ? String(assignedUserId) : '',
    source: 'messenger',
  }
}

function CustomerChoiceCard({ customer, active, onSelect }) {
  const typeMeta = getCustomerTypeMeta(customer)
  const TypeIcon = typeMeta.icon
  const name = customer.name || customer.lead?.name || `Customer #${customer.id}`
  const subtitle = [customer.phone, customer.email, customer.company].filter(Boolean).join(' | ')

  return (
    <button
      type="button"
      onClick={() => onSelect(customer)}
      className={[
        'w-full rounded-xl border p-3 text-start transition',
        active ? 'border-[#00A8B0] bg-[#E8F9FA] shadow-sm' : 'border-[#E5EEF0] bg-white hover:border-[#B8EFF2] hover:bg-[#FBFEFF]',
      ].join(' ')}
    >
      <span className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1FBFD] text-[#00878D]">
          {active ? <Check size={18} /> : <UsersRound size={18} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-black text-[#0F172A]">{name}</span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${typeMeta.className}`}>
              <TypeIcon size={11} />
              {typeMeta.label}
            </span>
            {Number(customer.is_deal || 0) === 0 ? (
              <span className="rounded-full bg-[#F8FAFC] px-2 py-0.5 text-[10px] font-bold text-[#64748B]">
                is_deal: 0
              </span>
            ) : null}
          </span>
          {subtitle ? <span className="mt-1 block truncate text-xs font-semibold text-[#64748B]">{subtitle}</span> : null}
          {customer.source || customer.lead?.source ? (
            <span className="mt-1 block truncate text-[11px] font-bold text-[#00878D]">
              المصدر: {customer.source || customer.lead?.source}
            </span>
          ) : null}
        </span>
      </span>
    </button>
  )
}

export function MessengerLinkCustomerDialog({
  open,
  conversation,
  conversationId,
  contactId,
  source = 'messenger',
  linkCustomerMutationFn,
  onClose,
  onLinked,
}) {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const tenantId = resolveTenantId(user)
  const [mode, setMode] = useState('select')
  const [query, setQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [form, setForm] = useState(() => buildDefaultForm(conversation))
  const [attributes, setAttributes] = useState(initialAttributes)
  const [interesteds, setInteresteds] = useState(initialInteresteds)
  const [error, setError] = useState('')

  const resolvedConversationId = conversationId || conversation?.id || conversation?.conversationId || ''
  const resolvedContactId = contactId || conversation?.contactId || conversation?.contact_id || conversation?.contact?.id || ''
  const customersQuery = useCustomers({
    per_page: 50,
    ...(query.trim() ? { search: query.trim() } : {}),
  })
  const customerMutations = useCustomerMutations()
  const statusesQuery = useStatuses({ type: 'lead' })
  const tagsQuery = useTags()
  const usersQuery = useUsers()
  const productsQuery = useProducts()

  const statuses = statusesQuery.data || []
  const tags = tagsQuery.data || []
  const users = usersQuery.data || []
  const products = productsQuery.data || []

  const linkMutation = useMutation({
    mutationFn: ({ targetContactId, customerId }) => (
      linkCustomerMutationFn
        ? linkCustomerMutationFn({
          contactId: targetContactId,
          conversationId: resolvedConversationId,
          customerId,
        })
        : messengerApi.linkCustomerToChat(targetContactId, { customer_id: customerId })
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATION_INFO_QUERY_KEY(resolvedConversationId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.all })
    },
  })

  const customers = useMemo(() => {
    const rows = flattenCustomersQueryData(customersQuery.data)
    const normalizedQuery = normalizeText(query)
    if (!normalizedQuery) return rows

    return rows.filter((customer) => {
      const haystack = [
        customer.name,
        customer.phone,
        customer.email,
        customer.company,
        customer.source,
        customer.lead_type,
        customer.lead?.source,
      ].map(normalizeText).join(' ')

      return haystack.includes(normalizedQuery)
    })
  }, [customersQuery.data, query])

  const isSaving = customerMutations.create.isPending || linkMutation.isPending

  useEffect(() => {
    if (!open) return
    setMode('select')
    setQuery('')
    setSelectedCustomer(null)
    setForm({
      ...buildDefaultForm(conversation),
      source,
      linked_by: user?.id ? String(user.id) : '',
    })
    setAttributes(initialAttributes)
    setInteresteds(initialInteresteds)
    setError('')
  }, [conversation, open, source, user?.id])

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const updateAttribute = (index, field, value) => {
    setAttributes((current) => current.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )))
  }

  const addAttribute = () => {
    setAttributes((current) => [...current, { key: '', value: '' }])
  }

  const removeAttribute = (index) => {
    setAttributes((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  const updateInterested = (index, field, value) => {
    setInteresteds((current) => current.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )))
  }

  const addInterested = () => {
    setInteresteds((current) => [...current, { product_id: '', note: '', interest_level: 'medium' }])
  }

  const removeInterested = (index) => {
    setInteresteds((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  const closeDialog = () => {
    if (isSaving) return
    onClose?.()
  }

  const linkCustomer = async (customer) => {
    const customerId = customer?.id || customer?.customer_id
    if (!resolvedContactId && !linkCustomerMutationFn) {
      setError('لا يمكن الربط لأن رقم جهة الاتصال غير موجود في بيانات المحادثة.')
      return
    }
    if (!customerId) {
      setError('اختار عميل صحيح قبل الربط.')
      return
    }

    setError('')
    await linkMutation.mutateAsync({ targetContactId: resolvedContactId, customerId })
    toast.success('تم ربط المحادثة بالعميل بنجاح')
    onLinked?.(customer)
    onClose?.()
  }

  const handleSelectSubmit = async () => {
    try {
      await linkCustomer(selectedCustomer)
    } catch (submitError) {
      setError(extractMessage(submitError, 'تعذر ربط المحادثة بالعميل.'))
    }
  }

  const handleCreateSubmit = async (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) {
      setError('الاسم ورقم الهاتف مطلوبان لإنشاء العميل.')
      return
    }

    try {
      setError('')
      const payload = {
        ...(tenantId ? { tenant_id: tenantId } : {}),
        automatic_distribution: false,
        form_id: null,
        ad_id: null,
        campaign_id: null,
        customers: [
          {
            name: form.name.trim(),
            email: cleanText(form.email),
            phone: form.phone.trim(),
            company: cleanText(form.company),
            type: form.type,
            status_type_id: normalizeNullableId(form.status_type_id),
            lead_id: normalizeNullableId(form.lead_id),
            agent_id: normalizeNullableId(form.agent_id),
            tag_id: normalizeNullableId(form.tag_id),
            source: form.source.trim() || source,
            linked_type: form.linked_type || 'automation',
            linked_by: normalizeNullableId(form.linked_by) || user?.id || null,
            link_date: form.link_date || new Date().toISOString().slice(0, 10),
            attributes: attributesRowsToObject(attributes),
            interesteds: interestRowsToPayload(interesteds),
            note: cleanText(form.note),
          },
        ],
      }

      const response = await customerMutations.create.mutateAsync(payload)
      const createdCustomer = getCreatedCustomer(response)
      if (!createdCustomer?.id) {
        await customersQuery.refetch()
        setMode('select')
        setError('تم إنشاء العميل. اختاره من القائمة لإتمام الربط.')
        return
      }

      await linkCustomer(createdCustomer)
    } catch (submitError) {
      setError(extractMessage(submitError, 'تعذر إنشاء العميل أو ربطه بالمحادثة.'))
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/35 p-2 sm:items-center sm:p-4" role="presentation" onClick={closeDialog}>
      <div
        className="max-h-[calc(100vh-1rem)] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-[#E5EEF0] bg-[#F8FEFF] px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-base font-black text-[#0F172A]">ربط المحادثة بعميل</h2>
            <p className="mt-1 truncate text-xs font-semibold text-[#64748B]">
              اختار عميل موجود أو أنشئ عميل جديد ثم اربطه بالمحادثة.
            </p>
          </div>
          <button
            type="button"
            onClick={closeDialog}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#D8E7EA] bg-white text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            title="إغلاق"
          >
            <X size={17} />
          </button>
        </header>

        <div className="border-b border-[#EEF2F4] bg-white px-4 pt-3">
          <div className="inline-flex rounded-xl border border-[#D8EEF2] bg-[#F8FEFF] p-1">
            <button
              type="button"
              onClick={() => setMode('select')}
              className={`h-9 rounded-lg px-3 text-xs font-black transition ${mode === 'select' ? 'bg-[#00A8B0] text-white shadow-sm' : 'text-[#64748B] hover:bg-white'}`}
            >
              اختيار عميل
            </button>
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`h-9 rounded-lg px-3 text-xs font-black transition ${mode === 'create' ? 'bg-[#00A8B0] text-white shadow-sm' : 'text-[#64748B] hover:bg-white'}`}
            >
              إنشاء عميل جديد
            </button>
          </div>
        </div>

        <div className="max-h-[calc(100vh-14rem)] overflow-y-auto p-4">
          {error ? (
            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
              {error}
            </div>
          ) : null}

          {mode === 'select' ? (
            <div className="space-y-3">
              <label className="flex h-11 items-center gap-2 rounded-xl border border-[#D8E7EA] bg-[#FBFEFF] px-3">
                <Search size={16} className="shrink-0 text-[#64748B]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
                  placeholder="بحث باسم العميل أو الهاتف أو البريد أو الشركة"
                />
              </label>

              <div className="grid max-h-[420px] gap-2 overflow-y-auto pe-1">
                {customersQuery.isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="h-20 animate-pulse rounded-xl bg-[#F1F5F9]" />
                  ))
                ) : null}

                {!customersQuery.isLoading && customers.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#CFE8EB] bg-[#FAFDFE] px-4 py-6 text-center text-sm font-bold text-[#64748B]">
                    لا يوجد عملاء مطابقين. يمكنك إنشاء عميل جديد من التاب الثاني.
                  </div>
                ) : null}

                {customers.map((customer) => (
                  <CustomerChoiceCard
                    key={customer.id}
                    customer={customer}
                    active={String(selectedCustomer?.id || '') === String(customer.id)}
                    onSelect={setSelectedCustomer}
                  />
                ))}
              </div>
            </div>
          ) : (
            <form id="messenger-create-customer-form" onSubmit={handleCreateSubmit} className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-bold text-[#0F172A]">
                الاسم
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="h-10 rounded-xl border border-[#D8E7EA] px-3 text-sm outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#BEEFF2]"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-[#0F172A]">
                الهاتف
                <input
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  className="h-10 rounded-xl border border-[#D8E7EA] px-3 text-sm outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#BEEFF2]"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-[#0F172A]">
                البريد الإلكتروني
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="h-10 rounded-xl border border-[#D8E7EA] px-3 text-sm outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#BEEFF2]"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-[#0F172A]">
                الشركة
                <input
                  value={form.company}
                  onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
                  className="h-10 rounded-xl border border-[#D8E7EA] px-3 text-sm outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#BEEFF2]"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-[#0F172A]">
                النوع
                <select
                  value={form.type}
                  onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                  className="h-10 rounded-xl border border-[#D8E7EA] bg-white px-3 text-sm outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#BEEFF2]"
                >
                  <option value="lead">Lead</option>
                  <option value="customer">Customer</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-[#0F172A]">
                المصدر
                <input
                  value={form.source}
                  onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))}
                  className="h-10 rounded-xl border border-[#D8E7EA] px-3 text-sm outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#BEEFF2]"
                />
              </label>

              <div className="sm:col-span-2 rounded-2xl border border-[#E5EEF0] bg-[#FBFEFF] p-3">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-black text-[#0F172A]">بيانات التصنيف والربط</h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-[#64748B]">API fields</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="grid gap-1.5 text-xs font-black text-[#0F172A]">
                    الحالة status_type_id
                    <select
                      value={form.status_type_id}
                      onChange={(event) => updateForm('status_type_id', event.target.value)}
                      className="h-10 rounded-xl border border-[#D8E7EA] bg-white px-3 text-sm outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#BEEFF2]"
                    >
                      <option value="">بدون حالة</option>
                      {statuses.map((status) => (
                        <option key={status.id} value={status.id}>{optionLabel(status)}</option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1.5 text-xs font-black text-[#0F172A]">
                    التاج tag_id
                    <select
                      value={form.tag_id}
                      onChange={(event) => updateForm('tag_id', event.target.value)}
                      className="h-10 rounded-xl border border-[#D8E7EA] bg-white px-3 text-sm outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#BEEFF2]"
                    >
                      <option value="">بدون تاج</option>
                      {tags.map((tag) => (
                        <option key={tag.id} value={tag.id}>{optionLabel(tag)}</option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1.5 text-xs font-black text-[#0F172A]">
                    السيلز agent_id
                    <select
                      value={form.agent_id}
                      onChange={(event) => updateForm('agent_id', event.target.value)}
                      className="h-10 rounded-xl border border-[#D8E7EA] bg-white px-3 text-sm outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#BEEFF2]"
                    >
                      <option value="">بدون سيلز</option>
                      {users.map((userItem) => (
                        <option key={userItem.id} value={userItem.id}>{optionLabel(userItem)}</option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1.5 text-xs font-black text-[#0F172A]">
                    lead_id
                    <input
                      value={form.lead_id}
                      onChange={(event) => updateForm('lead_id', event.target.value)}
                      placeholder="null"
                      className="h-10 rounded-xl border border-[#D8E7EA] px-3 text-sm outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#BEEFF2]"
                    />
                  </label>

                  <label className="grid gap-1.5 text-xs font-black text-[#0F172A]">
                    linked_type
                    <select
                      value={form.linked_type}
                      onChange={(event) => updateForm('linked_type', event.target.value)}
                      className="h-10 rounded-xl border border-[#D8E7EA] bg-white px-3 text-sm outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#BEEFF2]"
                    >
                      <option value="automation">automation</option>
                      <option value="manual">manual</option>
                    </select>
                  </label>

                  <label className="grid gap-1.5 text-xs font-black text-[#0F172A]">
                    linked_by
                    <select
                      value={form.linked_by}
                      onChange={(event) => updateForm('linked_by', event.target.value)}
                      className="h-10 rounded-xl border border-[#D8E7EA] bg-white px-3 text-sm outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#BEEFF2]"
                    >
                      <option value="">بدون مستخدم</option>
                      {users.map((userItem) => (
                        <option key={userItem.id} value={userItem.id}>{optionLabel(userItem)}</option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1.5 text-xs font-black text-[#0F172A] sm:col-span-3">
                    link_date
                    <input
                      type="date"
                      value={form.link_date}
                      onChange={(event) => updateForm('link_date', event.target.value)}
                      className="h-10 rounded-xl border border-[#D8E7EA] px-3 text-sm outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#BEEFF2]"
                    />
                  </label>
                </div>
              </div>

              <div className="sm:col-span-2 rounded-2xl border border-[#E5EEF0] bg-white p-3">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-black text-[#0F172A]">attributes</h3>
                  <button
                    type="button"
                    onClick={addAttribute}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#BEEFF2] bg-[#F8FEFF] px-2 text-xs font-black text-[#007A80] transition hover:bg-[#E8F9FA]"
                  >
                    <Plus size={13} />
                    إضافة خانة
                  </button>
                </div>

                <div className="space-y-2">
                  {attributes.map((attribute, index) => (
                    <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                      <input
                        value={attribute.key}
                        onChange={(event) => updateAttribute(index, 'key', event.target.value)}
                        placeholder="budget"
                        className="h-10 rounded-xl border border-[#D8E7EA] px-3 text-sm outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#BEEFF2]"
                      />
                      <input
                        value={attribute.value}
                        onChange={(event) => updateAttribute(index, 'value', event.target.value)}
                        placeholder="5000-10000"
                        className="h-10 rounded-xl border border-[#D8E7EA] px-3 text-sm outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#BEEFF2]"
                      />
                      <button
                        type="button"
                        onClick={() => removeAttribute(index)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
                        title="حذف"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2 rounded-2xl border border-[#E5EEF0] bg-[#FBFEFF] p-3">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-black text-[#0F172A]">interesteds</h3>
                  <button
                    type="button"
                    onClick={addInterested}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#BEEFF2] bg-white px-2 text-xs font-black text-[#007A80] transition hover:bg-[#E8F9FA]"
                  >
                    <Plus size={13} />
                    إضافة اهتمام
                  </button>
                </div>

                <div className="space-y-2">
                  {interesteds.map((interested, index) => (
                    <div key={index} className="grid gap-2 rounded-xl border border-[#E8F3F5] bg-white p-2 sm:grid-cols-[minmax(0,1fr)_130px_auto]">
                      <label className="grid gap-1 text-xs font-black text-[#64748B]">
                        product_id
                        <select
                          value={interested.product_id}
                          onChange={(event) => updateInterested(index, 'product_id', event.target.value)}
                          className="h-10 rounded-xl border border-[#D8E7EA] bg-white px-3 text-sm text-[#0F172A] outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#BEEFF2]"
                        >
                          <option value="">بدون منتج</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>{optionLabel(product)}</option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-1 text-xs font-black text-[#64748B]">
                        interest_level
                        <select
                          value={interested.interest_level}
                          onChange={(event) => updateInterested(index, 'interest_level', event.target.value)}
                          className="h-10 rounded-xl border border-[#D8E7EA] bg-white px-3 text-sm text-[#0F172A] outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#BEEFF2]"
                        >
                          <option value="low">low</option>
                          <option value="medium">medium</option>
                          <option value="high">high</option>
                        </select>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeInterested(index)}
                        className="mt-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
                        title="حذف"
                      >
                        <Trash2 size={15} />
                      </button>
                      <label className="grid gap-1 text-xs font-black text-[#64748B] sm:col-span-3">
                        note
                        <input
                          value={interested.note}
                          onChange={(event) => updateInterested(index, 'note', event.target.value)}
                          placeholder="مهتم بالشحن الدولي"
                          className="h-10 rounded-xl border border-[#D8E7EA] px-3 text-sm text-[#0F172A] outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#BEEFF2]"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <label className="grid gap-1.5 text-sm font-bold text-[#0F172A] sm:col-span-2">
                ملاحظة
                <textarea
                  value={form.note}
                  onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                  rows={3}
                  className="rounded-xl border border-[#D8E7EA] px-3 py-2 text-sm outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#BEEFF2]"
                />
              </label>
            </form>
          )}
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-[#E5EEF0] bg-[#FBFEFF] px-4 py-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={closeDialog}
            disabled={isSaving}
            className="h-10 rounded-xl border border-[#D8E7EA] bg-white px-4 text-sm font-black text-[#64748B] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
          >
            إلغاء
          </button>
          {mode === 'select' ? (
            <button
              type="button"
              onClick={handleSelectSubmit}
              disabled={!selectedCustomer || isSaving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#00A8B0] px-4 text-sm font-black text-white transition hover:bg-[#008E96] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              ربط العميل
            </button>
          ) : (
            <button
              type="submit"
              form="messenger-create-customer-form"
              disabled={isSaving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#00A8B0] px-4 text-sm font-black text-white transition hover:bg-[#008E96] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              إنشاء وربط
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}
