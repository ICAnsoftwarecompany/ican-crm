import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppDrawer } from '../../../shared/components/overlays/AppDrawer'
import { Button } from '../../../shared/components/ui/Button'
import { Input } from '../../../shared/components/ui/Input'
import { Tabs } from '../../../shared/components/ui/Tabs'
import {
  AdditionalDataFields,
  parseAdditionalData,
  serializeAdditionalData,
} from './AdditionalDataFields'

const INITIAL_FORM = {
  name: '',
  desc: '',
  category_id: '',
  image: null,
  status: '1',
}

function normalizeId(value) {
  if (value === null || value === undefined || value === '') return ''
  return String(value)
}

function getCategoryLabel(category) {
  if (category?._pathLabel) return category._pathLabel
  return category?.name || category?.title || `Category #${category?.id}`
}

function toFormState(category) {
  if (!category) return INITIAL_FORM

  return {
    name: category.name || category.title || '',
    desc: category.desc || category.description || '',
    category_id: normalizeId(category.category_id || category.parent_id || category.parent?.id),
    image: null,
    status: normalizeId(category.status ?? category.active ?? 1),
  }
}

function buildPayload(form, additionalRows, categoryType) {
  return {
    name: form.name.trim(),
    desc: form.desc.trim() || null,
    type: categoryType,
    category_id: form.category_id ? Number(form.category_id) : null,
    data: serializeAdditionalData(additionalRows),
    image: form.image || null,
    status: form.status === '' ? 1 : Number(form.status),
  }
}

export function CategoryFormDrawer({
  open,
  mode,
  category,
  initialParentId = '',
  categoryType = 'product',
  categories = [],
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const { t } = useTranslation()
  const [form, setForm] = useState(INITIAL_FORM)
  const [additionalRows, setAdditionalRows] = useState([])
  const [activeTab, setActiveTab] = useState('basic')
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (!open) return

    if (mode === 'create') {
      setForm({
        ...INITIAL_FORM,
        category_id: normalizeId(initialParentId),
      })
      setAdditionalRows([])
    } else {
      setForm(toFormState(category))
      setAdditionalRows(parseAdditionalData(category?.data))
    }

    setActiveTab('basic')
    setLocalError('')
  }, [category, initialParentId, mode, open])

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLocalError('')

    if (!form.name.trim()) {
      setLocalError(t('products.categoryFormDrawer.nameRequired'))
      return
    }

    await onSubmit(buildPayload(form, additionalRows, categoryType))
  }

  const parentCategories = categories.filter((item) => normalizeId(item.id) !== normalizeId(category?.id))
  const typeLabel = categoryType === 'service' ? 'service' : 'product'

  const tabs = [
    {
      id: 'basic',
      label: t('products.formDrawer.basicDataTab'),
      content: (
        <div className="space-y-4">
          <Input
            label={t('products.categoryFormDrawer.nameLabel')}
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder={t('products.categoryFormDrawer.namePlaceholder')}
          />

          <Input
            label={t('products.list.columns.description')}
            value={form.desc}
            onChange={(event) => updateField('desc', event.target.value)}
            placeholder={t('products.categoryFormDrawer.descPlaceholder')}
          />

          <Input label={t('products.formDrawer.typeLabel')} value={typeLabel} disabled readOnly />

          <label className="grid gap-1.5 text-sm font-medium text-[var(--text)]">
            {t('products.categoryFormDrawer.parentCategoryLabel')}
            <select
              value={form.category_id}
              onChange={(event) => updateField('category_id', event.target.value)}
              className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
            >
              <option value="">{t('products.categoryFormDrawer.noParentOption')}</option>
              {parentCategories.map((item) => (
                <option key={item.id} value={item.id}>
                  {getCategoryLabel(item)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-[var(--text)]">
            {t('products.categoryFormDrawer.imageLabel')}
            <input
              type="file"
              accept="image/*"
              onChange={(event) => updateField('image', event.target.files?.[0] || null)}
              className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-[var(--text)]">
            {t('activities.table.status')}
            <select
              value={form.status}
              onChange={(event) => updateField('status', event.target.value)}
              className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
            >
              <option value="1">{t('products.categories.active')}</option>
              <option value="0">{t('products.categories.inactive')}</option>
            </select>
          </label>
        </div>
      ),
    },
    {
      id: 'additional',
      label: t('products.formDrawer.additionalDataTab'),
      content: (
        <AdditionalDataFields
          rows={additionalRows}
          onChange={setAdditionalRows}
        />
      ),
    },
  ]

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      size="md"
      title={mode === 'create' ? t('products.categoryFormDrawer.addTitle') : t('products.categoryFormDrawer.editTitle')}
      description={t('products.categoryFormDrawer.typeSentDescription', { type: typeLabel })}
    >
      <form onSubmit={handleSubmit} className="flex min-h-[calc(100vh-7.5rem)] flex-col gap-4">
        {(localError || error) && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {localError || error}
          </div>
        )}

        <Tabs items={tabs} active={activeTab} onChange={setActiveTab} variant="underline" />

        <div className="mt-auto flex items-center justify-end gap-2 border-t border-[var(--border)] pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit" loading={loading}>
            {mode === 'create' ? t('products.categoryFormDrawer.addTitle') : t('products.formDrawer.saveEdit')}
          </Button>
        </div>
      </form>
    </AppDrawer>
  )
}
