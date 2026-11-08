import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, ShieldOff, Pencil } from 'lucide-react'
import { useCustomers } from '../../../../../features/customers/hooks/useCustomers'
import { useProposalMutations, useProposalRecipients } from '../../../../../features/proposals'
import { Button } from '../../../../../shared/components/ui/Button'
import { Input } from '../../../../../shared/components/ui/Input'
import { Select } from '../../../../../shared/components/ui/Select'
import { extractCustomersFromInfinite, getCustomerName } from '../utils/proposalPayloads'

const emptyRecipient = () => ({ customer_id: '', name: '', email: '', phone: '', role: '', is_primary: false, can_view: true, can_accept: true, can_sign: false, signature_required: false })

function ErrorMessage(error) {
  const errors = error?.response?.data?.errors
  return errors ? Object.values(errors).flat().join('، ') : error?.response?.data?.message || error?.message || 'تعذّر إتمام العملية'
}

export function ProposalRecipientsPanel({ proposalId }) {
  const [page, setPage] = useState(1)
  const [drafts, setDrafts] = useState([])
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const query = useProposalRecipients(proposalId, page)
  const customersQuery = useCustomers({ per_page: 60 })
  const mutations = useProposalMutations()
  const customers = extractCustomersFromInfinite(customersQuery.data)
  const rows = query.data?.rows || []
  const busy = mutations.createProposalRecipients.isPending || mutations.updateProposalRecipient.isPending || mutations.deleteProposalRecipient.isPending || mutations.revokeProposalRecipient.isPending

  const refresh = async () => { await query.refetch() }
  const changeDraft = (index, key, value) => setDrafts(current => current.map((row, i) => i === index ? { ...row, [key]: value } : row))
  const addDraft = () => setDrafts(current => [...current, emptyRecipient()])
  const chooseCustomer = (index, id) => {
    const customer = customers.find(row => String(row.id) === String(id))
    setDrafts(current => current.map((row, i) => i === index ? { ...row, customer_id: id, name: customer ? getCustomerName(customer) : '', email: customer?.email || '', phone: customer?.phone || '' } : row))
  }

  const addRecipients = async () => {
    if (!drafts.length) return
    if (drafts.some(row => !row.customer_id)) { toast.error('اختر عميلًا لكل مستلم'); return }
    const ids = drafts.map(row => String(row.customer_id))
    if (new Set(ids).size !== ids.length || ids.some(id => rows.some(row => String(row.customer_id) === id))) { toast.error('لا يمكن تكرار نفس العميل ضمن مستلمي العرض'); return }
    const hasPrimary = rows.some(row => row.is_primary)
    const recipients = drafts.map((row, index) => ({
      customer_id: Number(row.customer_id),
      ...(row.name.trim() ? { name: row.name.trim() } : {}),
      ...(row.email.trim() ? { email: row.email.trim() } : {}),
      ...(row.phone.trim() ? { phone: row.phone.trim() } : {}),
      role: row.role.trim() || null, is_primary: !hasPrimary && index === 0,
      can_view: row.can_view, can_accept: row.can_accept, can_sign: row.can_sign,
      signature_required: row.can_sign && row.signature_required, signature_sort_order: index + 1,
    }))
    try {
      await mutations.createProposalRecipients.mutateAsync({ proposal_id: Number(proposalId), recipients })
      setDrafts([])
      await refresh()
      toast.success('تم إضافة المستلمين')
    } catch (error) { toast.error(ErrorMessage(error)) }
  }

  const updateRecipient = async () => {
    if (!editing || !editForm) return
    try {
      await mutations.updateProposalRecipient.mutateAsync({
        proposalId, recipientId: editing,
        payload: {
          name: editForm.name || null, email: editForm.email || null, phone: editForm.phone || null,
          role: editForm.role || null, is_primary: editForm.is_primary,
          can_view: editForm.can_view, can_accept: editForm.can_accept, can_sign: editForm.can_sign,
          expires_at: editForm.expires_at || null, metadata: editForm.metadata || null,
        },
      })
      setEditing(null)
      setEditForm(null)
      await refresh()
      toast.success('تم تعديل المستلم')
    } catch (error) { toast.error(ErrorMessage(error)) }
  }

  const remove = async (recipient, revoke = false) => {
    if (!window.confirm(revoke ? 'إلغاء صلاحية هذا المستلم؟' : 'حذف هذا المستلم من عرض السعر؟')) return
    try {
      if (revoke) await mutations.revokeProposalRecipient.mutateAsync({ proposalId, recipientId: recipient.id })
      else await mutations.deleteProposalRecipient.mutateAsync({ proposalId, recipientId: recipient.id })
      await refresh()
      toast.success(revoke ? 'تم إلغاء الصلاحية' : 'تم حذف المستلم')
    } catch (error) { toast.error(ErrorMessage(error)) }
  }

  const permissionFields = [['can_view', 'المشاهدة'], ['can_accept', 'الموافقة'], ['can_sign', 'التوقيع']]
  return (
    <div className="space-y-4 text-sm">
      <div>
        <h3 className="font-black">مستلمو عرض السعر</h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">إضافة عدة عملاء أو تعديل صلاحياتهم أو حذفهم أو إلغاء وصولهم.</p>
      </div>
      {query.isLoading && <p>جارٍ تحميل المستلمين...</p>}
      {query.isError && <p role="alert" className="text-red-600">تعذر تحميل المستلمين. <Button size="sm" variant="ghost" onClick={() => query.refetch()}>إعادة المحاولة</Button></p>}
      {!query.isLoading && !query.isError && !rows.length && <p className="rounded-lg border border-dashed border-[var(--border)] p-3 text-xs">لا يوجد مستلمون لهذا العرض بعد.</p>}
      {rows.map(recipient => (
        <div key={recipient.id} className="space-y-2 rounded-xl border border-[var(--border)] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="font-bold">{recipient.name || recipient.customer?.name || 'مستلم'} {recipient.is_primary ? '• أساسي' : ''}</div>
              <div className="break-all text-xs text-[var(--text-muted)]">{recipient.email || 'بدون بريد'} · {recipient.role || 'بدون دور'}</div>
            </div>
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => { setEditing(recipient.id); setEditForm({ name: recipient.name || '', email: recipient.email || '', phone: recipient.phone || '', role: recipient.role || '', is_primary: Boolean(recipient.is_primary), can_view: Boolean(recipient.can_view), can_accept: Boolean(recipient.can_accept), can_sign: Boolean(recipient.can_sign), expires_at: recipient.expires_at ? recipient.expires_at.slice(0, 10) : '', metadata: recipient.metadata || null }) }}><Pencil size={14} /> تعديل</Button>
              <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => remove(recipient, true)}><ShieldOff size={14} /> Revoke</Button>
              <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => remove(recipient)}><Trash2 size={14} /> حذف</Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
            <span>مشاهدة: {recipient.can_view ? 'نعم' : 'لا'}</span>
            <span>موافقة: {recipient.can_accept ? 'نعم' : 'لا'}</span>
            <span>توقيع: {recipient.can_sign ? 'نعم' : 'لا'}</span>
          </div>
          {editing === recipient.id && editForm && (
            <div className="space-y-2 rounded-lg bg-[var(--surface-2)] p-3">
              {['name', 'email', 'phone', 'role'].map(key => <Input key={key} label={{ name: 'الاسم', email: 'البريد الإلكتروني', phone: 'الهاتف', role: 'الدور' }[key]} value={editForm[key]} onChange={event => setEditForm(current => ({ ...current, [key]: event.target.value }))} />)}
              <Input label="انتهاء الصلاحية (اختياري)" type="date" value={editForm.expires_at} onChange={event => setEditForm(current => ({ ...current, expires_at: event.target.value }))} />
              <div className="flex flex-wrap gap-2">
                {[['is_primary', 'المستلم الأساسي'], ...permissionFields].map(([key, label]) => <label key={key} className="flex items-center gap-1 text-xs"><input type="checkbox" checked={editForm[key]} onChange={event => setEditForm(current => ({ ...current, [key]: event.target.checked }))} />{label}</label>)}
              </div>
              <div className="flex gap-2">
                <Button size="sm" disabled={busy} onClick={updateRecipient}>حفظ التعديل</Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditing(null); setEditForm(null) }}>إلغاء</Button>
              </div>
            </div>
          )}
        </div>
      ))}
      {(query.data?.lastPage || 1) > 1 && <div className="flex items-center justify-between gap-2 text-xs">
        <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>السابق</Button>
        <span>صفحة {page} من {query.data.lastPage}</span>
        <Button size="sm" variant="ghost" disabled={page >= query.data.lastPage} onClick={() => setPage(value => value + 1)}>التالي</Button>
      </div>}
      <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
        <div className="font-bold">إضافة مستلمين جدد</div>
        {drafts.map((draft, index) => (
          <div key={index} className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
            <div className="flex items-center justify-between"><strong>مستلم {index + 1}</strong><Button size="sm" variant="ghost" onClick={() => setDrafts(current => current.filter((_, i) => i !== index))}>إزالة</Button></div>
            <Select label="العميل" value={draft.customer_id} options={customers.map(customer => ({ value: String(customer.id), label: getCustomerName(customer) }))} placeholder="اختر العميل" onChange={value => chooseCustomer(index, value)} />
            <Input label="الاسم" value={draft.name} onChange={event => changeDraft(index, 'name', event.target.value)} />
            <Input label="البريد الإلكتروني" type="email" value={draft.email} onChange={event => changeDraft(index, 'email', event.target.value)} />
            <Input label="الهاتف" value={draft.phone} onChange={event => changeDraft(index, 'phone', event.target.value)} />
            <Input label="الدور" value={draft.role} onChange={event => changeDraft(index, 'role', event.target.value)} />
            <div className="flex flex-wrap gap-2">
              {permissionFields.concat([['signature_required', 'التوقيع إلزامي']]).map(([key, label]) => <label key={key} className="flex items-center gap-1 text-xs"><input type="checkbox" checked={draft[key]} disabled={key === 'signature_required' && !draft.can_sign} onChange={event => changeDraft(index, key, event.target.checked)} />{label}</label>)}
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addDraft}><Plus size={15} /> إضافة عميل</Button>
        {drafts.length > 0 && <Button type="button" disabled={busy} className="w-full" onClick={addRecipients}>حفظ {drafts.length} مستلم</Button>}
      </div>
    </div>
  )
}
