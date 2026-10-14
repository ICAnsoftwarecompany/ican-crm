import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { categoryTypeForKind } from '../../constants/catalogOptions'
import { useProductMutations } from '../../hooks/useProducts'
import { formatApiError } from '../../utils/apiErrors'
import { getCreatedId } from '../../utils/catalogPayloads'
import { getCategoryLabel } from '../../utils/categoryTree'
import { FormError, TextAreaField } from '../../components/common/catalogUi'

/**
 * Quick category (2026-10-15): name, parent and description, saved with `POST /api/tenant/category/create` (same body
 * as the categories page: `name`, `desc`, `type`, `category_id`, `status`). `onSaved(id)` selects it.
 * Images and additional fields stay on the categories page.
 */
export function QuickCategoryDialog({ open, kind = 'product', categories = [], parentId = '', onClose, onSaved }) {
  const { t } = useTranslation()
  const { createCategory } = useProductMutations()
  const [form, setForm] = useState({ name: '', parent: '', desc: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setForm({ name: '', parent: parentId ? String(parentId) : '', desc: '' })
    setError('')
  }, [open, parentId])

  const submit = async () => {
    if (!form.name.trim()) return setError(t('catalog.validation.nameRequired'))
    try {
      const response = await createCategory.mutateAsync({
        name: form.name.trim(),
        desc: form.desc.trim() || null,
        type: categoryTypeForKind(kind),
        category_id: form.parent ? Number(form.parent) : null,
        status: 1,
      })
      toast.success(t('productSetup.quickCategory.created', { name: form.name.trim() }))
      onSaved?.(getCreatedId(response))
      onClose()
    } catch (requestError) {
      setError(formatApiError(requestError, t('catalog.common.saveFailed')))
    }
  }

  return (
    <FormDialog open={open} onClose={onClose} onSubmit={submit} loading={createCategory.isPending} title={t('productSetup.quickCategory.title')} description={t('productSetup.quickCategory.description')}>
      <FormError message={error} />
      <Input label={t('productSetup.quickCategory.name')} value={form.name} autoFocus onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
      <Select
        label={t('productSetup.quickCategory.parent')}
        value={form.parent}
        placeholder={t('productSetup.quickCategory.noParent')}
        options={categories.map((category) => ({ value: String(category.id), label: category._pathLabel || getCategoryLabel(category) }))}
        onChange={(value) => setForm((current) => ({ ...current, parent: value }))}
      />
      <TextAreaField label={t('productSetup.quickCategory.desc')} rows={2} value={form.desc} onChange={(value) => setForm((current) => ({ ...current, desc: value }))} />
    </FormDialog>
  )
}
