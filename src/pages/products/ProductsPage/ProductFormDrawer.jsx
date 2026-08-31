import { useEffect, useMemo, useState } from 'react'
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
  entityLabel = 'منتج',
  loading,
  error,
  onClose,
  onSubmit,
}) {
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
      setLocalError('اسم المنتج مطلوب')
      return
    }

    await onSubmit(buildPayload(form, additionalRows, productType))
  }

  const tabs = [
    {
      id: 'basic',
      label: 'البيانات الأساسية',
      content: (
        <div className="space-y-4">
          <Input
            label={`اسم ${entityLabel}`}
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="مثال: باقة شهرية"
          />
          <Input
            label="الوصف"
            value={form.desc}
            onChange={(event) => updateField('desc', event.target.value)}
            placeholder={`وصف مختصر لـ ${entityLabel}`}
          />
          <Input
            label="السعر"
            type="number"
            value={form.price}
            onChange={(event) => updateField('price', event.target.value)}
            placeholder="100"
          />

          <Input
            label="النوع"
            value={productType}
            disabled
            readOnly
          />

          <label className="grid gap-1.5 text-sm font-medium text-[var(--text)]">
            صورة {entityLabel}
            <input
              type="file"
              accept="image/*"
              onChange={(event) => updateField('image', event.target.files?.[0] || null)}
              className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-[var(--text)]">
            التصنيف
            <select
              value={form.category_id}
              onChange={(event) => handleCategoryChange(event.target.value)}
              className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
            >
              <option value="">بدون تصنيف</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-[var(--text)]">
            الحالة
            <select
              value={form.status}
              onChange={(event) => updateField('status', event.target.value)}
              className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
            >
              <option value="1">نشط</option>
              <option value="0">معطل</option>
            </select>
          </label>
        </div>
      ),
    },
    {
      id: 'additional',
      label: 'البيانات الإضافية',
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
      title={mode === 'create' ? `إضافة ${entityLabel}` : `تعديل ${entityLabel}`}
      description="أدخل بيانات المنتج واربطه بالفئة المناسبة."
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
            إلغاء
          </Button>
          <Button type="submit" loading={loading}>
            {mode === 'create' ? `إضافة ${entityLabel}` : 'حفظ التعديل'}
          </Button>
        </div>
      </form>
    </AppDrawer>
  )
}
