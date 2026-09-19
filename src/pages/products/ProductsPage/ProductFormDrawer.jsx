import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppDrawer } from '../../../shared/components/overlays/AppDrawer'
import { Button } from '../../../shared/components/ui/Button'
import { Input } from '../../../shared/components/ui/Input'
import { Tabs } from '../../../shared/components/ui/Tabs'
import {
  AdditionalDataFields,
  createEmptyAdditionalRow,
  getAdditionalFieldNames,
  parseAdditionalData,
  serializeAdditionalData,
} from './AdditionalDataFields'

const INITIAL_FORM = {
  name: '',
  desc: '',
  price: '',
  image: null,
  category_id: '',
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

function toFormState(product) {
  if (!product) return INITIAL_FORM

  return {
    name: product.name || '',
    desc: product.desc || product.description || '',
    price: product.price ?? '',
    image: null,
    category_id: normalizeId(product.category_id || product.category?.id || product.categroy?.id),
    status: normalizeId(product.status ?? product.active ?? 1),
  }
}

function buildPayload(form, additionalRows, productType) {
  return {
    name: form.name.trim(),
    desc: form.desc.trim() || null,
    price: form.price === '' ? null : form.price,
    image: form.image || null,
    data: serializeAdditionalData(additionalRows),
    category_id: form.category_id ? Number(form.category_id) : null,
    status: form.status === '' ? 1 : Number(form.status),
    type: productType,
  }
}

export function ProductFormDrawer({
  open,
  mode,
  product,
  categories = [],
  productFieldNames = [],
  productType = 'product',
  entityLabel,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const { t } = useTranslation()
  const resolvedEntityLabel = entityLabel ?? t('products.list.entityLabel')
  const [form, setForm] = useState(INITIAL_FORM)
  const [additionalRows, setAdditionalRows] = useState([])
  const [activeTab, setActiveTab] = useState('basic')
  const [localError, setLocalError] = useState('')

  const selectedCategory = useMemo(() => {
    return categories.find((category) => normalizeId(category.id) === normalizeId(form.category_id))
  }, [categories, form.category_id])

  const categoryFieldNames = useMemo(() => {
    return getAdditionalFieldNames(selectedCategory?.data)
  }, [selectedCategory?.data])

  const suggestedFieldNames = useMemo(() => {
    return Array.from(new Set([...productFieldNames, ...categoryFieldNames].filter(Boolean)))
  }, [categoryFieldNames, productFieldNames])

  useEffect(() => {
    if (!open) return

    const nextForm = toFormState(product)
    setForm(nextForm)
    setAdditionalRows(parseAdditionalData(product?.data))
    setActiveTab('basic')
    setLocalError('')
  }, [open, product])

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const applyCategoryFields = (categoryId) => {
    const category = categories.find((item) => normalizeId(item.id) === normalizeId(categoryId))
    const fieldNames = getAdditionalFieldNames(category?.data)
    if (!fieldNames.length) return

    setAdditionalRows((currentRows) => {
      const existingNames = new Set(currentRows.map((row) => row.name).filter(Boolean))
      const nextRows = [...currentRows]

      fieldNames.forEach((name) => {
        if (!existingNames.has(name)) {
          nextRows.push(createEmptyAdditionalRow(name))
        }
      })

      return nextRows
    })
  }

  const handleCategoryChange = (categoryId) => {
    updateField('category_id', categoryId)
    applyCategoryFields(categoryId)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLocalError('')

    if (!form.name.trim()) {
      setLocalError(t('products.formDrawer.nameRequired', { entity: resolvedEntityLabel }))
      return
    }

    await onSubmit(buildPayload(form, additionalRows, productType))
  }

  const tabs = [
    {
      id: 'basic',
      label: t('products.formDrawer.basicDataTab'),
      content: (
        <div className="space-y-4">
          <Input
            label={t('products.formDrawer.nameLabel', { entity: resolvedEntityLabel })}
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder={t('products.formDrawer.namePlaceholder')}
          />
          <Input
            label={t('products.list.columns.description')}
            value={form.desc}
            onChange={(event) => updateField('desc', event.target.value)}
            placeholder={t('products.formDrawer.descPlaceholder', { entity: resolvedEntityLabel })}
          />
          <Input
            label={t('products.list.columns.price')}
            type="number"
            value={form.price}
            onChange={(event) => updateField('price', event.target.value)}
            placeholder="100"
          />

          <Input
            label={t('products.formDrawer.typeLabel')}
            value={productType}
            disabled
            readOnly
          />

          <label className="grid gap-1.5 text-sm font-medium text-[var(--text)]">
            {t('products.formDrawer.imageLabel', { entity: resolvedEntityLabel })}
            <input
              type="file"
              accept="image/*"
              onChange={(event) => updateField('image', event.target.files?.[0] || null)}
              className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-[var(--text)]">
            {t('products.formDrawer.categoryLabel')}
            <select
              value={form.category_id}
              onChange={(event) => handleCategoryChange(event.target.value)}
              className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
            >
              <option value="">{t('products.formDrawer.noCategoryOption')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-[var(--text)]">
            {t('activities.table.status')}
            <select
              value={form.status}
              onChange={(event) => updateField('status', event.target.value)}
              className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
            >
              <option value="1">{t('products.list.activeStatus')}</option>
              <option value="0">{t('products.list.inactiveStatus')}</option>
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
          suggestions={suggestedFieldNames}
        />
      ),
    },
  ]

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      size="lg"
      title={mode === 'create' ? t('products.formDrawer.addTitle', { entity: resolvedEntityLabel }) : t('products.formDrawer.editTitle', { entity: resolvedEntityLabel })}
      description={t('products.formDrawer.drawerDescription')}
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
            {mode === 'create' ? t('products.formDrawer.addTitle', { entity: resolvedEntityLabel }) : t('products.formDrawer.saveEdit')}
          </Button>
        </div>
      </form>
    </AppDrawer>
  )
}
