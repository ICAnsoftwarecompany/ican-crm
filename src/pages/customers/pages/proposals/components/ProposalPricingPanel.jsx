import { Check, PackagePlus, Star, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
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
  subtotal: '',
  discount: '',
  tax: '',
  total: '',
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

export function ProposalPricingPanel({ proposal, options = [], selectedOptionId, onSelectOption }) {
  const [optionForm, setOptionForm] = useState(EMPTY_OPTION)
  const [itemForm, setItemForm] = useState(EMPTY_ITEM)
  const mutations = useProposalMutations()
  const productsQuery = useProducts()

  const selectedOption = options.find((option) => String(option.id) === String(selectedOptionId)) || options[0]
  const itemsQuery = useProposalOptionItems(proposal?.id, selectedOption?.id, undefined, { enabled: Boolean(proposal?.id && selectedOption?.id) })
  const products = productsQuery.data || []

  const productOptions = useMemo(() => products.map((product) => ({
    value: String(product.id),
    label: product.name || `منتج #${product.id}`,
  })), [products])

  const updateOptionForm = (key, value) => setOptionForm((form) => ({ ...form, [key]: value }))
  const updateItemForm = (key, value) => setItemForm((form) => ({ ...form, [key]: value }))

  const handleCreateOption = async (event) => {
    event.preventDefault()
    if (!optionForm.name.trim()) {
      toast.error('اكتب اسم خيار السعر')
      return
    }

    const subtotal = toNumber(optionForm.subtotal, 0)
    const discount = toNumber(optionForm.discount, 0)
    const tax = toNumber(optionForm.tax, 0)
    const total = toNumber(optionForm.total, subtotal - discount + tax)

    const response = await mutations.createProposalOption.mutateAsync({
      proposalId: proposal.id,
      payload: {
        name: optionForm.name.trim(),
        description: optionForm.description.trim() || undefined,
        sort_order: options.length,
        is_recommended: !options.length,
        is_active: true,
        subtotal,
        discount,
        tax,
        total,
      },
    })

    const created = response?.data?.data || response?.data || response
    onSelectOption?.(created?.id)
    setOptionForm(EMPTY_OPTION)
    toast.success('تم إضافة خيار السعر')
  }

  const handleCreateItem = async (event) => {
    event.preventDefault()
    if (!selectedOption?.id) {
      toast.error('اختر خيار السعر أولا')
      return
    }

    await mutations.createProposalOptionItem.mutateAsync({
      proposalId: proposal.id,
      optionId: selectedOption.id,
      payload: {
        product_id: toNumber(itemForm.product_id),
        name: itemForm.name.trim() || undefined,
        description: itemForm.description.trim() || undefined,
        quantity: toNumber(itemForm.quantity, 1),
        unit_price: toNumber(itemForm.unit_price, 0),
        discount: toNumber(itemForm.discount, 0),
        tax: toNumber(itemForm.tax, 0),
        sort_order: itemsQuery.data?.length || 0,
        is_optional: false,
        metadata: {},
      },
    })
    setItemForm(EMPTY_ITEM)
    toast.success('تم إضافة بند السعر')
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
        <div className="mb-3 text-xs font-black text-[var(--text-muted)]">خيارات الأسعار</div>
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
          {!options.length ? <p className="text-xs font-semibold text-[var(--text-muted)]">لا توجد خيارات أسعار بعد.</p> : null}
        </div>
      </section>

      <form onSubmit={handleCreateOption} className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
        <div className="mb-3 text-xs font-black text-[var(--text-muted)]">إضافة خيار سعر</div>
        <div className="space-y-3">
          <Input label="اسم الخيار" value={optionForm.name} onChange={(event) => updateOptionForm('name', event.target.value)} />
          <Input label="وصف مختصر" value={optionForm.description} onChange={(event) => updateOptionForm('description', event.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <Input label="الإجمالي الفرعي" type="number" value={optionForm.subtotal} onChange={(event) => updateOptionForm('subtotal', event.target.value)} />
            <Input label="الخصم" type="number" value={optionForm.discount} onChange={(event) => updateOptionForm('discount', event.target.value)} />
            <Input label="الضريبة" type="number" value={optionForm.tax} onChange={(event) => updateOptionForm('tax', event.target.value)} />
            <Input label="الإجمالي" type="number" value={optionForm.total} onChange={(event) => updateOptionForm('total', event.target.value)} />
          </div>
          <Button type="submit" variant="accent" size="sm" className="w-full" loading={mutations.createProposalOption.isPending}>
            <Check size={15} />
            حفظ خيار السعر
          </Button>
        </div>
      </form>

      {selectedOption ? (
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="text-xs font-black text-[var(--text-muted)]">بنود {selectedOption.name}</div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#EF4444]"
              onClick={() => mutations.deleteProposalOption.mutate({ proposalId: proposal.id, optionId: selectedOption.id })}
              aria-label="حذف الخيار"
            >
              <Trash2 size={15} />
            </Button>
          </div>

          <div className="mb-4 space-y-2">
            {(itemsQuery.data || []).map((item) => (
              <div key={item.id || item.name} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                <div className="font-black text-[var(--text)]">{item.name || item.product?.name || `بند #${item.id}`}</div>
                <div className="mt-1 text-xs font-bold text-[var(--text-muted)]" dir="ltr">
                  {item.quantity || 1} x {formatMoney(item.unit_price, proposal?.currency)}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleCreateItem} className="space-y-3">
            <Select label="منتج من النظام" value={itemForm.product_id} onChange={(value) => updateItemForm('product_id', value)} options={productOptions} placeholder="اختياري" />
            <Input label="اسم البند" value={itemForm.name} onChange={(event) => updateItemForm('name', event.target.value)} />
            <Input label="وصف البند" value={itemForm.description} onChange={(event) => updateItemForm('description', event.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Input label="الكمية" type="number" value={itemForm.quantity} onChange={(event) => updateItemForm('quantity', event.target.value)} />
              <Input label="سعر الوحدة" type="number" value={itemForm.unit_price} onChange={(event) => updateItemForm('unit_price', event.target.value)} />
            </div>
            <Button type="submit" variant="primary" size="sm" className="w-full" loading={mutations.createProposalOptionItem.isPending}>
              <PackagePlus size={15} />
              إضافة بند
            </Button>
          </form>
        </section>
      ) : null}
    </div>
  )
}
