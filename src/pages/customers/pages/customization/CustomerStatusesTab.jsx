import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Edit3, Plus, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { definitionsApi } from '../../../../features/definitions/api/definitionsApi'
import { QUERY_KEYS } from '../../../../shared/constants/queryKeys'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { Button } from '../../../../shared/components/ui/Button'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { Spinner } from '../../../../shared/components/ui/Spinner'

const DEFAULT_FORM = {
  status: '',
  type: 'customer',
  active: '1',
  color: '#3B82F6',
}

const STATUS_TYPE_OPTIONS = [
  { value: 'customer', label: 'customer' },
  { value: 'lead', label: 'lead' },
  { value: 'deal', label: 'deal' },
]

const ACTIVE_OPTIONS = [
  { value: '1', label: 'نشط' },
  { value: '0', label: 'غير نشط' },
]

function flattenStatuses(response) {
  const data = response?.data

  if (Array.isArray(response)) return response
  if (Array.isArray(data)) return data
  if (!data || typeof data !== 'object') return []

  return Object.entries(data).flatMap(([type, items]) => {
    if (!Array.isArray(items)) return []
    return items.map((item) => ({
      ...item,
      type: item.type || type,
    }))
  })
}

function toFormState(status) {
  if (!status) return DEFAULT_FORM

  return {
    status: status.status || '',
    type: status.type || 'customer',
    active: String(status.active ?? 1),
    color: status.color || '#3B82F6',
  }
}

function buildPayload(form) {
  return {
    status: form.status.trim(),
    type: form.type,
    active: form.active,
    color: form.color || '',
  }
}

export function CustomerStatusesTab() {
  const queryClient = useQueryClient()
  const [dialogMode, setDialogMode] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [formError, setFormError] = useState('')

  const statusesQuery = useQuery({
    queryKey: QUERY_KEYS.statuses.list,
    queryFn: () => definitionsApi.getStatuses(),
    select: flattenStatuses,
  })

  const invalidateStatuses = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.statuses.all })
  }

  const createStatusMutation = useMutation({
    mutationFn: definitionsApi.createStatus,
    onSuccess: () => {
      toast.success('تمت إضافة الحالة')
      invalidateStatuses()
      closeDialog()
    },
    onError: (error) => {
      toast.error(extractMessage(error, 'تعذر إضافة الحالة'))
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, payload }) => definitionsApi.updateStatus(id, payload),
    onSuccess: () => {
      toast.success('تم تعديل الحالة')
      invalidateStatuses()
      closeDialog()
    },
    onError: (error) => {
      toast.error(extractMessage(error, 'تعذر تعديل الحالة'))
    },
  })

  const statuses = statusesQuery.data || []
  const groupedStatuses = useMemo(() => {
    return statuses.reduce((groups, status) => {
      const type = status.type || 'customer'
      groups[type] = groups[type] || []
      groups[type].push(status)
      return groups
    }, {})
  }, [statuses])

  const openCreateDialog = () => {
    setDialogMode('create')
    setSelectedStatus(null)
    setForm(DEFAULT_FORM)
    setFormError('')
  }

  const openEditDialog = (status) => {
    setDialogMode('edit')
    setSelectedStatus(status)
    setForm(toFormState(status))
    setFormError('')
  }

  const closeDialog = () => {
    setDialogMode(null)
    setSelectedStatus(null)
    setForm(DEFAULT_FORM)
    setFormError('')
  }

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

    if (dialogMode === 'edit' && selectedStatus?.id) {
      updateStatusMutation.mutate({ id: selectedStatus.id, payload })
      return
    }

    createStatusMutation.mutate(payload)
  }

  const isSaving = createStatusMutation.isPending || updateStatusMutation.isPending
  const dialogTitle = dialogMode === 'edit' ? 'تعديل حالة' : 'إضافة حالة'
  const submitText = dialogMode === 'edit' ? 'حفظ التعديل' : 'إضافة'

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-[var(--text)]">حالات العملاء</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
            إدارة حالات العملاء والليد والصفقات من نفس تعريفات النظام.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => statusesQuery.refetch()}
            disabled={statusesQuery.isFetching}
            className="gap-2"
          >
            <RefreshCw size={16} className={statusesQuery.isFetching ? 'animate-spin' : ''} />
            تحديث
          </Button>
          <Button variant="primary" className="gap-2" onClick={openCreateDialog}>
            <Plus size={16} />
            إضافة حالة
          </Button>
        </div>
      </div>

      {statusesQuery.isLoading && (
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <Spinner size="lg" />
        </div>
      )}

      {statusesQuery.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {extractMessage(statusesQuery.error, 'تعذر تحميل الحالات')}
        </div>
      )}

      {!statusesQuery.isLoading && !statusesQuery.isError && statuses.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--text-muted)]">
          لا توجد حالات مسجلة بعد.
        </div>
      )}

      {!statusesQuery.isLoading && !statusesQuery.isError && statuses.length > 0 && (
        <div className="space-y-4">
          {Object.entries(groupedStatuses).map(([type, items]) => (
            <section key={type} className="space-y-2">
              <h3 className="text-sm font-bold text-[var(--text-muted)]">{type}</h3>
              <div className="grid gap-3">
                {items.map((status) => (
                  <article
                    key={status.id}
                    className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                        style={{ backgroundColor: status.color || '#64748B' }}
                      >
                        <CheckCircle2 size={18} />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-[var(--text)]">{status.status}</h4>
                          <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
                            {status.active ? 'نشط' : 'غير نشط'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                          اللون: {status.color || 'بدون لون'} · النوع: {status.type}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openEditDialog(status)}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 text-sm text-[var(--text)] hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]"
                    >
                      <Edit3 size={15} />
                      تعديل
                    </button>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <FormDialog
        open={Boolean(dialogMode)}
        onClose={closeDialog}
        title={dialogTitle}
        description="اكتب بيانات الحالة كما سيتم إرسالها إلى API التعريفات."
        onSubmit={handleSubmit}
        submitText={submitText}
        loading={isSaving}
        submitDisabled={!form.status.trim()}
      >
        <Input
          label="اسم الحالة"
          value={form.status}
          onChange={(event) => updateForm('status', event.target.value)}
          error={formError}
          placeholder="مثال: deal_status2"
        />

        <Select
          label="النوع"
          value={form.type}
          onChange={(value) => updateForm('type', value)}
          options={STATUS_TYPE_OPTIONS}
          placeholder="اختر النوع"
        />

        <Select
          label="الحالة"
          value={form.active}
          onChange={(value) => updateForm('active', value)}
          options={ACTIVE_OPTIONS}
          placeholder="اختر الحالة"
        />

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
    </div>
  )
}
