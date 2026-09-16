import { useEffect, useMemo, useState } from 'react'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'

const DEFAULT_FORM = {
  status: '',
  priority: '1',
  color: '#3B82F6',
  stageKind: 'normal',
  has_resone: '0',
}

const STAGE_KIND_OPTIONS = [
  { value: 'normal', label: 'حالة عادية' },
  { value: 'deal', label: 'حالة التعاقد/الشراء' },
  { value: 'lost', label: 'حالة الخسارة' },
  { value: 'retarget', label: 'حالة إعادة الاستهداف' },
]

const REASON_OPTIONS = [
  { value: '1', label: 'نعم - إجبار وجود سبب' },
  { value: '0', label: 'لا' },
]

function toBit(value) {
  return Number(value) === 1 ? 1 : 0
}

function toFormState(status) {
  if (!status) return DEFAULT_FORM

  let stageKind = 'normal'
  if (toBit(status.is_deal) === 1) stageKind = 'deal'
  else if (toBit(status.is_lost) === 1) stageKind = 'lost'
  else if (toBit(status.is_retarget) === 1) stageKind = 'retarget'

  return {
    status: status.status || '',
    priority: String(status.priority ?? 1),
    color: status.color || '#3B82F6',
    stageKind,
    has_resone: String(status.has_resone ?? 0),
  }
}

function applyStageFlags(stageKind) {
  return {
    is_deal: stageKind === 'deal' ? 1 : 0,
    is_lost: stageKind === 'lost' ? 1 : 0,
    is_retarget: stageKind === 'retarget' ? 1 : 0,
  }
}

function buildPayload(form) {
  return {
    status: String(form.status || '').trim(),
    type: 'lead',
    active: 1,
    priority: Number(form.priority || 1),
    color: form.color || '',
    has_resone: toBit(form.has_resone),
    ...applyStageFlags(form.stageKind),
  }
}

function getLeadStatuses(statuses) {
  return (statuses || []).filter((item) => String(item?.type || '').toLowerCase() === 'lead')
}

function getReservedPriorities(statuses, selectedStatusId) {
  const values = getLeadStatuses(statuses)
    .filter((item) => String(item?.id ?? '') !== String(selectedStatusId ?? ''))
    .map((item) => Number(item?.priority))
    .filter((value) => Number.isFinite(value))

  return [...new Set(values)].sort((a, b) => a - b)
}

export function StatusDefinitionDialog({
  open,
  mode,
  selectedStatus,
  statuses,
  loading,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!open) return
    setForm(toFormState(selectedStatus))
    setFormError('')
  }, [open, selectedStatus])

  const reservedPriorities = useMemo(
    () => getReservedPriorities(statuses, selectedStatus?.id),
    [selectedStatus?.id, statuses]
  )

  const submitText = mode === 'edit' ? 'حفظ التعديل' : 'إضافة'
  const title = mode === 'edit' ? 'تعديل تعريف الحالة' : 'تعريف حالة جديدة'

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setFormError('')
  }

  const handleSubmit = () => {
    const payload = buildPayload(form)

    if (!payload.status) {
      setFormError('اسم الحالة مطلوب')
      return
    }

    if (!Number.isFinite(payload.priority) || payload.priority < 0) {
      setFormError('الترتيب يجب أن يكون رقمًا صحيحًا أكبر من أو يساوي 0')
      return
    }

    const isReserved = reservedPriorities.includes(payload.priority)
    if (isReserved) {
      setFormError(`الترتيب ${payload.priority} محجوز بالفعل، اختر ترتيبًا آخر`)
      return
    }

    onSubmit?.(payload)
  }

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={title}
      description="تعريف الحالة يتم دائمًا كـ lead و active=1، مع اختيار نوع المرحلة والسبب والترتيب واللون."
      onSubmit={handleSubmit}
      submitText={submitText}
      loading={loading}
      submitDisabled={!String(form.status || '').trim()}
    >
      <Input
        label="اسم الحالة"
        value={form.status}
        onChange={(event) => updateForm('status', event.target.value)}
        error={formError}
        placeholder="مثال: مرحلة التواصل الأول"
      />

      <Select
        label="نوع المرحلة"
        value={form.stageKind}
        onChange={(value) => updateForm('stageKind', value)}
        options={STAGE_KIND_OPTIONS}
        placeholder="اختر نوع المرحلة"
      />

      <Select
        label="هل تحتاج الحالة سبب؟"
        value={form.has_resone}
        onChange={(value) => updateForm('has_resone', value)}
        options={REASON_OPTIONS}
        placeholder="اختر"
      />

      <Input
        label="الترتيب"
        type="number"
        min="0"
        value={form.priority}
        onChange={(event) => updateForm('priority', event.target.value)}
        placeholder="1"
      />

      <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2 text-xs text-[#475569]">
        <div className="font-semibold">الترتيبات المحجوزة حاليًا (lead):</div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {reservedPriorities.length ? reservedPriorities.map((value) => (
            <span key={value} className="rounded-full border border-[#CBD5E1] bg-white px-2 py-0.5 font-semibold">
              {value}
            </span>
          )) : (
            <span className="font-semibold text-[#64748B]">لا يوجد ترتيب محجوز</span>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Input
          label="اللون"
          type="text"
          value={form.color}
          onChange={(event) => updateForm('color', event.target.value)}
          placeholder="#F54927"
          endIcon={
            <span
              className="h-4 w-4 rounded-full border border-[var(--border)]"
              style={{ backgroundColor: form.color || '#FFFFFF' }}
            />
          }
        />
        <input
          type="color"
          value={form.color || '#3B82F6'}
          onChange={(event) => updateForm('color', event.target.value)}
          className="h-9 w-20 cursor-pointer rounded border border-[var(--border)] bg-[var(--surface)] p-1"
          aria-label="اختيار لون الحالة"
        />
      </div>
    </FormDialog>
  )
}
