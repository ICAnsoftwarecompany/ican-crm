import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit3, Hash, Plus, RefreshCw, Tag } from 'lucide-react'
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
  tag: '',
  type: 'customer',
  active: '1',
}

const TAG_TYPE_OPTIONS = [
  { value: 'customer', label: 'customer' },
  { value: 'lead', label: 'lead' },
  { value: 'deal', label: 'deal' },
]

const ACTIVE_OPTIONS = [
  { value: '1', label: 'نشط' },
  { value: '0', label: 'غير نشط' },
]

function flattenTags(response) {
  const data = response?.data

  if (Array.isArray(response)) return response
  if (Array.isArray(data)) return data
  if (!data || typeof data !== 'object') return []

  return Object.entries(data).flatMap(([type, items]) => {
    if (!Array.isArray(items)) return []
    return items.map((item) => ({
      ...item,
      tag: item.tag || item.name || item.status || '',
      type: item.type || type,
    }))
  })
}

function toFormState(tag) {
  if (!tag) return DEFAULT_FORM

  return {
    tag: tag.tag || tag.name || tag.status || '',
    type: tag.type || 'customer',
    active: String(tag.active ?? 1),
  }
}

function buildPayload(form) {
  return {
    tag: form.tag.trim(),
    type: form.type,
    active: form.active,
  }
}

export function CustomerTagsTab() {
  const queryClient = useQueryClient()
  const [dialogMode, setDialogMode] = useState(null)
  const [selectedTag, setSelectedTag] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [formError, setFormError] = useState('')

  const tagsQuery = useQuery({
    queryKey: QUERY_KEYS.tags.list,
    queryFn: () => definitionsApi.getTags(),
    select: flattenTags,
  })

  const invalidateTags = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags.all })
  }

  const createTagMutation = useMutation({
    mutationFn: definitionsApi.createTag,
    onSuccess: () => {
      toast.success('تمت إضافة التاج')
      invalidateTags()
      closeDialog()
    },
    onError: (error) => {
      toast.error(extractMessage(error, 'تعذر إضافة التاج'))
    },
  })

  const updateTagMutation = useMutation({
    mutationFn: ({ id, payload }) => definitionsApi.updateTag(id, payload),
    onSuccess: () => {
      toast.success('تم تعديل التاج')
      invalidateTags()
      closeDialog()
    },
    onError: (error) => {
      toast.error(extractMessage(error, 'تعذر تعديل التاج'))
    },
  })

  const tags = tagsQuery.data || []
  const groupedTags = useMemo(() => {
    return tags.reduce((groups, tag) => {
      const type = tag.type || 'customer'
      groups[type] = groups[type] || []
      groups[type].push(tag)
      return groups
    }, {})
  }, [tags])

  const openCreateDialog = () => {
    setDialogMode('create')
    setSelectedTag(null)
    setForm(DEFAULT_FORM)
    setFormError('')
  }

  const openEditDialog = (tag) => {
    setDialogMode('edit')
    setSelectedTag(tag)
    setForm(toFormState(tag))
    setFormError('')
  }

  const closeDialog = () => {
    setDialogMode(null)
    setSelectedTag(null)
    setForm(DEFAULT_FORM)
    setFormError('')
  }

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setFormError('')
  }

  const handleSubmit = () => {
    const payload = buildPayload(form)
    if (!payload.tag) {
      setFormError('اسم التاج مطلوب')
      return
    }

    if (dialogMode === 'edit' && selectedTag?.id) {
      updateTagMutation.mutate({ id: selectedTag.id, payload })
      return
    }

    createTagMutation.mutate(payload)
  }

  const isSaving = createTagMutation.isPending || updateTagMutation.isPending
  const dialogTitle = dialogMode === 'edit' ? 'تعديل تاج' : 'إضافة تاج'
  const submitText = dialogMode === 'edit' ? 'حفظ التعديل' : 'إضافة'

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-[var(--text)]">تاج العملاء</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
            إدارة الوسوم المستخدمة لتجميع العملاء والليد والصفقات.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => tagsQuery.refetch()}
            disabled={tagsQuery.isFetching}
            className="gap-2"
          >
            <RefreshCw size={16} className={tagsQuery.isFetching ? 'animate-spin' : ''} />
            تحديث
          </Button>
          <Button variant="primary" className="gap-2" onClick={openCreateDialog}>
            <Plus size={16} />
            إضافة تاج
          </Button>
        </div>
      </div>

      {tagsQuery.isLoading && (
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <Spinner size="lg" />
        </div>
      )}

      {tagsQuery.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {extractMessage(tagsQuery.error, 'تعذر تحميل التاجات')}
        </div>
      )}

      {!tagsQuery.isLoading && !tagsQuery.isError && tags.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--text-muted)]">
          لا توجد تاجات مسجلة بعد.
        </div>
      )}

      {!tagsQuery.isLoading && !tagsQuery.isError && tags.length > 0 && (
        <div className="space-y-4">
          {Object.entries(groupedTags).map(([type, items]) => (
            <section key={type} className="space-y-2">
              <h3 className="text-sm font-bold text-[var(--text-muted)]">{type}</h3>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((tag) => (
                  <article key={tag.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00A8B0] text-white">
                          <Tag size={17} />
                        </span>
                        <div className="min-w-0">
                          <h4 className="truncate font-bold text-[var(--text)]">
                            {tag.tag || tag.name || tag.status}
                          </h4>
                          <p className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                            <Hash size={12} />
                            {tag.active ? 'نشط' : 'غير نشط'} · {tag.type}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => openEditDialog(tag)}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]"
                        title="تعديل التاج"
                        aria-label="تعديل التاج"
                      >
                        <Edit3 size={15} />
                      </button>
                    </div>
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
        description="اكتب بيانات التاج كما سيتم إرسالها إلى API التعريفات."
        onSubmit={handleSubmit}
        submitText={submitText}
        loading={isSaving}
        submitDisabled={!form.tag.trim()}
      >
        <Input
          label="اسم التاج"
          value={form.tag}
          onChange={(event) => updateForm('tag', event.target.value)}
          error={formError}
          placeholder="مثال: test"
        />

        <Select
          label="النوع"
          value={form.type}
          onChange={(value) => updateForm('type', value)}
          options={TAG_TYPE_OPTIONS}
          placeholder="اختر النوع"
        />

        <Select
          label="الحالة"
          value={form.active}
          onChange={(value) => updateForm('active', value)}
          options={ACTIVE_OPTIONS}
          placeholder="اختر الحالة"
        />
      </FormDialog>
    </div>
  )
}
