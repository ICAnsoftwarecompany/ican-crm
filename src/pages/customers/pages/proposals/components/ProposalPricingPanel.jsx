import { Check, PackagePlus, Star, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '../../../../../shared/components/ui/Button'
import { Input } from '../../../../../shared/components/ui/Input'
import { Select } from '../../../../../shared/components/ui/Select'
import { useProposalMutations, useProposalOptionItems } from '../../../../../features/proposals'
import { useProducts } from '../../../../../features/products/hooks/useProducts'
import { formatMoney } from '../utils/proposalPayloads'

const EMPTY_OPTION = {
  name: '',
  description: '',
}

const EMPTY_ITEM = {
  product_id: '',
  name: '',
  description: '',
  quantity: 1,
  unit_price: '',
  discount: '',
  tax: '',
}

function toNumber(value, fallback = undefined) {
  if (value === '' || value === null || value === undefined) return fallback
  const numberValue = Number(value)
  return Number.isNaN(numberValue) ? fallback : numberValue
}

export function ProposalPricingPanel({ proposal, options = [], selectedOptionId, onSelectOption, focusItems = false }) {
  const { t } = useTranslation()
  const [optionForm, setOptionForm] = useState(EMPTY_OPTION)
  const [itemForm, setItemForm] = useState(EMPTY_ITEM)
  const [editingItemId, setEditingItemId] = useState(null)
  const itemsRef = useRef(null)
  const [showAlternativeForm, setShowAlternativeForm] = useState(false)
  useEffect(() => { if (focusItems) itemsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, [focusItems])
  const mutations = useProposalMutations()
  const productsQuery = useProducts()

  const selectedOption = options.find((option) => String(option.id) === String(selectedOptionId)) || options[0]
  const itemsQuery = useProposalOptionItems(proposal?.id, selectedOption?.id, undefined, { enabled: Boolean(proposal?.id && selectedOption?.id) })
  const products = productsQuery.data || []

  const productOptions = useMemo(() => products.map((product) => ({
    value: String(product.id),
    label: product.name || t('proposals.pricing.productFallback', { id: product.id }),
  })), [products, t])

  const updateOptionForm = (key, value) => setOptionForm((form) => ({ ...form, [key]: value }))
  const updateItemForm = (key, value) => setItemForm((form) => ({ ...form, [key]: value }))
  const selectProduct = (value) => {
    const product = products.find(item => String(item.id) === String(value))
    setItemForm(form => ({ ...form, product_id: value, name: product?.name || form.name, description: product?.description || form.description, unit_price: product?.selling_price ?? product?.sale_price ?? product?.price ?? form.unit_price }))
  }

  const createOption = async (name, description = '') => {
    const response = await mutations.createProposalOption.mutateAsync({
      proposalId: proposal.id,
      payload: { name, description: description || undefined, sort_order: options.length, is_recommended: !options.length, is_active: true, subtotal: 0, discount: 0, tax: 0, total: 0 },
    })
    const created = response?.data?.data || response?.data || response
    if (!created?.id) throw new Error('لم يرجع السيرفر رقم خيار السعر؛ حدّث الصفحة قبل إعادة المحاولة')
    onSelectOption?.(created.id)
    return created
  }

  const handleCreateOption = async (event) => {
    event.preventDefault()
    if (!optionForm.name.trim()) {
      toast.error(t('proposals.pricing.writeOptionNameFirst'))
      return
    }

    try {
      await createOption(optionForm.name.trim(), optionForm.description.trim())
      setOptionForm(EMPTY_OPTION)
      setShowAlternativeForm(false)
      toast.success(t('proposals.pricing.optionAdded'))
    } catch (error) { toast.error(error?.message || 'تعذر إنشاء خيار السعر') }
  }

  const totalsFor = (rows) => rows.reduce((sum, item) => {
    const subtotal = Math.max(0, Number(item.quantity || 0) * Number(item.unit_price || 0))
    return {
      subtotal: sum.subtotal + subtotal,
      discount: sum.discount + Number(item.discount || 0),
      tax: sum.tax + Number(item.tax || 0),
      total: sum.total + subtotal - Number(item.discount || 0) + Number(item.tax || 0),
    }
  }, { subtotal: 0, discount: 0, tax: 0, total: 0 })

  const syncTotals = async (option, rows) => {
    const totals = totalsFor(rows)
    await mutations.updateProposalOption.mutateAsync({
      proposalId: proposal.id,
      optionId: option.id,
      payload: { name: option.name, description: option.description || undefined, sort_order: option.sort_order ?? 0, is_recommended: Boolean(option.is_recommended), is_active: option.is_active ?? true, ...totals },
    })
  }

  const handleCreateItem = async (event) => {
    event.preventDefault()
    if (!selectedOption?.id) {
      toast.error(t('proposals.pricing.chooseOptionFirst'))
      return
    }
    if (!itemForm.name.trim() && !itemForm.product_id) { toast.error('اختر منتجًا أو اكتب اسم الخدمة'); return }
    if (itemForm.unit_price === '' || Number(itemForm.quantity) <= 0 || Number(itemForm.unit_price) < 0 || Number(itemForm.discount) < 0 || Number(itemForm.tax) < 0) { toast.error('راجع الكمية والسعر والخصم والضريبة'); return }

    const itemPayload = {
        product_id: toNumber(itemForm.product_id),
        name: itemForm.name.trim() || undefined,
        description: itemForm.description.trim() || undefined,
        quantity: toNumber(itemForm.quantity, 1),
        unit_price: toNumber(itemForm.unit_price, 0),
        discount: toNumber(itemForm.discount, 0),
        tax: toNumber(itemForm.tax, 0),
        sort_order: editingItemId ? (itemsQuery.data || []).find(item => item.id === editingItemId)?.sort_order ?? 0 : itemsQuery.data?.length || 0,
        is_optional: false,
        metadata: {},
    }
    try {
    if (editingItemId) {
      await mutations.updateProposalOptionItem.mutateAsync({ proposalId: proposal.id, optionId: selectedOption.id, itemId: editingItemId, payload: itemPayload })
    } else {
      await mutations.createProposalOptionItem.mutateAsync({ proposalId: proposal.id, optionId: selectedOption.id, payload: itemPayload })
    }
    // Always use the canonical persisted rows to avoid overwriting totals from stale local data.
    const updatedRows = (await itemsQuery.refetch()).data || []
    try { await syncTotals(selectedOption, updatedRows) } catch { toast.warning('تم حفظ البند، لكن تعذّر تحديث إجمالي خيار السعر؛ راجع الإجمالي قبل الإرسال') }
    setItemForm({ ...EMPTY_ITEM })
    setEditingItemId(null)
    toast.success(editingItemId ? 'تم تحديث البند / Item updated' : t('proposals.pricing.itemAdded'))
    } catch (error) { toast.error(error?.response?.data?.message || error?.message || 'تعذر حفظ البند') }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
        <div className="mb-3 text-xs font-black text-[var(--text-muted)]">{t('proposals.builder.defaults.pricingTitle')}</div>
        <div className="space-y-2">
          {options.map((option) => (
            <button
              key={option.id || option.name}
              type="button"
              onClick={() => onSelectOption?.(option.id)}
              className={`w-full rounded-lg border px-3 py-2 text-start text-sm ${
                String(selectedOption?.id) === String(option.id)
                  ? 'border-[#00C2CB] bg-[#E8F9FA] text-[#007A80]'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-black">{option.name}</span>
                {option.is_recommended ? <Star size={14} fill="currentColor" /> : null}
              </div>
              <div className="mt-1 text-xs font-bold" dir="ltr">{formatMoney(option.total ?? option.subtotal, proposal?.currency)}</div>
            </button>
          ))}
          {!options.length ? <p className="text-xs font-semibold text-[var(--text-muted)]">ابدأ بإنشاء التسعيرة الأساسية لإضافة المنتجات والخدمات.</p> : null}
        </div>
      </section>

      {!options.length && <Button type="button" variant="accent" className="w-full" loading={mutations.createProposalOption.isPending} onClick={async () => { try { await createOption('التسعيرة الأساسية'); toast.success('يمكنك الآن إضافة المنتجات والخدمات') } catch (error) { toast.error(error?.message || 'تعذر إنشاء التسعيرة') } }}>ابدأ إضافة المنتجات والخدمات</Button>}
      {options.length > 0 && <Button type="button" variant="ghost" className="w-full" onClick={() => setShowAlternativeForm(value => !value)}>+ إضافة خيار تسعير بديل (اختياري)</Button>}
      {(showAlternativeForm || !options.length) && <form onSubmit={handleCreateOption} className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
        <div className="mb-3 text-xs font-black text-[var(--text-muted)]">{t('proposals.pricing.addPricingOptionTitle')}</div>
        <div className="space-y-3">
          <Input label={t('proposals.pricing.optionNameLabel')} value={optionForm.name} onChange={(event) => updateOptionForm('name', event.target.value)} />
          <Input label={t('proposals.wizard.shortDescriptionLabel')} value={optionForm.description} onChange={(event) => updateOptionForm('description', event.target.value)} />
          <Button type="submit" variant="accent" size="sm" className="w-full" loading={mutations.createProposalOption.isPending}>
            <Check size={15} />
            {t('proposals.pricing.savePricingOption')}
          </Button>
        </div>
      </form>}

      {selectedOption ? (
        <section ref={itemsRef} className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="text-xs font-black text-[var(--text-muted)]">{t('proposals.pricing.itemsOf', { name: selectedOption.name })}</div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#EF4444]"
              onClick={() => mutations.deleteProposalOption.mutate({ proposalId: proposal.id, optionId: selectedOption.id })}
              aria-label={t('proposals.pricing.deleteOption')}
            >
              <Trash2 size={15} />
            </Button>
          </div>

          <div className="mb-4 space-y-2">
            {(itemsQuery.data || []).map((item) => (
              <div key={item.id || item.name} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                <div className="font-black text-[var(--text)]">{item.name || item.product?.name || t('proposals.pricing.itemFallback', { id: item.id })}</div>
                <div className="mt-1 text-xs font-bold text-[var(--text-muted)]" dir="ltr">
                  {item.quantity ?? 1} × {formatMoney(item.unit_price, proposal?.currency)} · Discount: {formatMoney(item.discount || 0, proposal?.currency)} · Tax: {formatMoney(item.tax || 0, proposal?.currency)}
                </div>
                <div className="mt-2 flex gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setEditingItemId(item.id); setItemForm({ product_id: String(item.product_id || ''), name: item.name || '', description: item.description || '', quantity: item.quantity ?? 1, unit_price: item.unit_price ?? '', discount: item.discount ?? 0, tax: item.tax ?? 0 }) }}>تعديل / Edit</Button>
                  <Button type="button" variant="ghost" size="sm" disabled={mutations.deleteProposalOptionItem.isPending} onClick={async () => { if (!window.confirm('حذف البند؟ / Delete this item?')) return; try { await mutations.deleteProposalOptionItem.mutateAsync({ proposalId: proposal.id, optionId: selectedOption.id, itemId: item.id }); try { await syncTotals(selectedOption, (itemsQuery.data || []).filter(row => String(row.id) !== String(item.id))) } catch { toast.warning('تم حذف البند لكن تعذّر تحديث الإجمالي') } } catch { toast.error('تعذر حذف البند') } }}>حذف / Delete</Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm">
            {(() => { const totals = totalsFor(itemsQuery.data || []); return <><div>الإجمالي الفرعي: {formatMoney(totals.subtotal, proposal?.currency)}</div><div>الخصم: {formatMoney(totals.discount, proposal?.currency)}</div><div>الضريبة: {formatMoney(totals.tax, proposal?.currency)}</div><div className="mt-2 font-black">الإجمالي النهائي: {formatMoney(totals.total, proposal?.currency)}</div></> })()}
          </div>
          <form onSubmit={handleCreateItem} className="space-y-3">
            <Select label={t('proposals.pricing.productFromSystem')} value={itemForm.product_id} onChange={selectProduct} options={productOptions} placeholder={t('customers.followUp.optionalPlaceholder')} />
            <Input label={t('proposals.pricing.itemNameLabel')} value={itemForm.name} onChange={(event) => updateItemForm('name', event.target.value)} />
            <Input label={t('proposals.pricing.itemDescLabel')} value={itemForm.description} onChange={(event) => updateItemForm('description', event.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Input label={t('proposals.pricing.quantityLabel')} type="number" value={itemForm.quantity} onChange={(event) => updateItemForm('quantity', event.target.value)} />
              <Input label={t('proposals.pricing.unitPriceLabel')} type="number" value={itemForm.unit_price} onChange={(event) => updateItemForm('unit_price', event.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input label="الخصم / Discount (amount)" type="number" value={itemForm.discount} onChange={event => updateItemForm('discount', event.target.value)} />
              <Input label="الضريبة / Tax (amount)" type="number" value={itemForm.tax} onChange={event => updateItemForm('tax', event.target.value)} />
            </div>
            <div className="text-sm font-bold" dir="ltr">Total: {formatMoney(Math.max(0, (Number(itemForm.quantity) || 0) * (Number(itemForm.unit_price) || 0) - (Number(itemForm.discount) || 0) + (Number(itemForm.tax) || 0)), proposal?.currency)}</div>
            {editingItemId && <Button type="button" variant="ghost" size="sm" onClick={() => { setEditingItemId(null); setItemForm({ ...EMPTY_ITEM }) }}>إلغاء التعديل / Cancel edit</Button>}
            <Button type="submit" variant="primary" size="sm" className="w-full" loading={mutations.createProposalOptionItem.isPending || mutations.updateProposalOptionItem.isPending}>
              <PackagePlus size={15} />
              {editingItemId ? 'حفظ التعديل / Save changes' : t('proposals.pricing.addItem')}
            </Button>
          </form>
        </section>
      ) : null}
    </div>
  )
}
