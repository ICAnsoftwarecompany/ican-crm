import { useEffect, useMemo, useState } from 'react'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'

const DEFAULT_FORM = {
  status: '',
  priority: '1',
  color: '#3B82F6',
  stageKind: 'normal',
  has_resone: '0',
}

const STAGE_KIND_OPTIONS = [
  { value: 'normal', get label() { return i18n.t('customers.customization.stageKinds.normal') } },
  { value: 'deal', get label() { return i18n.t('customers.customization.stageKinds.deal') } },
  { value: 'lost', get label() { return i18n.t('customers.customization.stageKinds.lost') } },
  { value: 'retarget', get label() { return i18n.t('customers.customization.stageKinds.retarget') } },
]

const REASON_OPTIONS = [
  { value: '1', get label() { return i18n.t('customers.customization.reasonYes') } },
  { value: '0', get label() { return i18n.t('customers.customization.reasonNo') } },
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
  const { t } = useTranslation()
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

  const submitText = mode === 'edit' ? t('customers.customization.saveChanges') : t('customers.customization.add')
  const title = mode === 'edit' ? t('customers.customization.editStatusDefinition') : t('customers.customization.newStatusDefinition')

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setFormError('')
  }

  const handleSubmit = () => {
    const payload = buildPayload(form)

    if (!payload.status) {
      setFormError(t('customers.customization.statusNameRequired'))
      return
    }

    if (!Number.isFinite(payload.priority) || payload.priority < 0) {
      setFormError(t('customers.customization.orderInvalid'))
      return
    }

    const isReserved = reservedPriorities.includes(payload.priority)
    if (isReserved) {
      setFormError(t('customers.customization.orderTaken', { value: payload.priority }))
      return
    }

    onSubmit?.(payload)
  }

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={title}
      description={t('customers.customization.statusDialogDescription')}
      onSubmit={handleSubmit}
      submitText={submitText}
      loading={loading}
      submitDisabled={!String(form.status || '').trim()}
    >
      <Input
        label={t('customers.customization.statusName')}
        value={form.status}
        onChange={(event) => updateForm('status', event.target.value)}
        error={formError}
        placeholder={t('customers.customization.statusNamePlaceholder')}
      />

      <Select
        label={t('customers.customization.stageKind')}
        value={form.stageKind}
        onChange={(value) => updateForm('stageKind', value)}
        options={STAGE_KIND_OPTIONS}
        placeholder={t('customers.customization.chooseStageKind')}
      />

      <Select
        label={t('customers.customization.needsReason')}
        value={form.has_resone}
        onChange={(value) => updateForm('has_resone', value)}
        options={REASON_OPTIONS}
        placeholder={t('customers.customization.choose')}
      />

      <Input
        label={t('customers.customization.orderLabel')}
        type="number"
        min="0"
        value={form.priority}
        onChange={(event) => updateForm('priority', event.target.value)}
        placeholder="1"
      />

      <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2 text-xs text-[#475569]">
        <div className="font-semibold">{t('customers.customization.reservedOrders')}</div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {reservedPriorities.length ? reservedPriorities.map((value) => (
            <span key={value} className="rounded-full border border-[#CBD5E1] bg-white px-2 py-0.5 font-semibold">
              {value}
            </span>
          )) : (
            <span className="font-semibold text-[#64748B]">{t('customers.customization.noReservedOrders')}</span>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Input
          label={t('customers.customization.color')}
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
          aria-label={t('customers.customization.chooseColor')}
        />
      </div>
    </FormDialog>
  )
}
