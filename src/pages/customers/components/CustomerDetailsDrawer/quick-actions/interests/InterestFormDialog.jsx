import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { useLeadMutations } from '../../../../../../features/leads/hooks/useLeads'
import { useProducts } from '../../../../../../features/products/hooks/useProducts'
import { FormDialog } from '../../../../../../shared/components/overlays/FormDialog'
import { extractMessage } from '../../../../../../shared/utils/apiResponse'

const INTEREST_LEVELS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

function getLeadId(customer) {
  return customer?.lead_id || customer?.lead?.id
}

function getCustomerName(customer) {
  return customer?.name || customer?.lead?.name || customer?.email || customer?.phone || 'العميل'
}

function getProductLabel(product) {
  return [
    product?.name || `Product #${product?.id || ''}`,
    product?.code ? `(${product.code})` : '',
    product?.price ? `- ${product.price}` : '',
  ].filter(Boolean).join(' ')
}

export function InterestFormDialog({
  open,
  customer,
  interest = null,
  onClose,
  onSaved,
}) {
  const mutations = useLeadMutations()
  const productsQuery = useProducts()
  const products = productsQuery.data || []
  const leadId = getLeadId(customer)
  const isEdit = Boolean(interest?.id)
  const [productId, setProductId] = useState('')
  const [note, setNote] = useState('')
  const [interestLevel, setInterestLevel] = useState('high')
  const [error, setError] = useState('')

  const selectedProduct = useMemo(
    () => products.find((product) => String(product?.id) === String(productId)) || null,
    [productId, products]
  )

  useEffect(() => {
    if (!open) return

    setProductId(interest?.product_id || interest?.product?.id || interest?.products?.id || '')
    setNote(interest?.note || interest?.notes || '')
    setInterestLevel(interest?.interest_level || 'high')
    setError('')
  }, [interest, open])

  const handleSubmit = async () => {
    if (!leadId) {
      setError('لا يوجد lead مرتبط بهذا العميل')
      return
    }

    if (!productId) {
      setError('اختر المنتج أولا')
      return
    }

    const item = {
      product_id: Number(productId),
      note: note.trim(),
      interest_level: interestLevel,
    }

    const payload = {
      lead_id: Number(leadId),
      interesteds: [
        isEdit ? { ...item, id: interest.id } : item,
      ],
    }

    try {
      const response = isEdit
        ? await mutations.updateInterested.mutateAsync({ ...payload, id: interest.id })
        : await mutations.saveInterested.mutateAsync(payload)

      toast.success(isEdit ? 'تم تعديل الاهتمام' : 'تم إضافة الاهتمام')
      onSaved?.(response, payload)
      onClose?.()
    } catch (requestError) {
      toast.error(extractMessage(requestError, isEdit ? 'تعذر تعديل الاهتمام' : 'تعذر إضافة الاهتمام'))
    }
  }

  const loading = mutations.saveInterested.isPending || mutations.updateInterested.isPending

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={isEdit ? 'تعديل اهتمام' : 'إضافة اهتمام'}
      description={`العميل: ${getCustomerName(customer)}`}
      onSubmit={handleSubmit}
      submitText={isEdit ? 'حفظ التعديل' : 'إضافة الاهتمام'}
      loading={loading}
      submitDisabled={!leadId || !productId}
      size="lg"
      className="max-w-2xl"
    >
      <label className="grid gap-1.5 text-sm font-bold text-[var(--text)]">
        <span>المنتج</span>
        <select
          value={productId}
          onChange={(event) => {
            setProductId(event.target.value)
            if (error) setError('')
          }}
          disabled={productsQuery.isLoading || loading}
          className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm font-semibold text-[var(--text)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
        >
          <option value="">{productsQuery.isLoading ? 'جاري تحميل المنتجات...' : 'اختر المنتج'}</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {getProductLabel(product)}
            </option>
          ))}
        </select>
      </label>

      {selectedProduct ? (
        <div className="rounded-xl border border-[#E5F7F8] bg-[#F8FEFF] p-3 text-xs font-bold text-[var(--text-muted)]">
          {selectedProduct.desc || selectedProduct.description || selectedProduct.code || 'تم اختيار المنتج'}
        </div>
      ) : null}

      <label className="grid gap-1.5 text-sm font-bold text-[var(--text)]">
        <span>درجة الاهتمام</span>
        <select
          value={interestLevel}
          onChange={(event) => setInterestLevel(event.target.value)}
          disabled={loading}
          className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm font-semibold text-[var(--text)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
        >
          {INTEREST_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5 text-sm font-bold text-[var(--text)]">
        <span>ملاحظة</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={4}
          disabled={loading}
          className="w-full resize-y rounded-lg border border-[var(--border)] bg-white p-3 text-sm font-semibold text-[var(--text)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
          placeholder="اكتب ملاحظة الاهتمام"
        />
      </label>

      {error ? <p className="text-xs font-bold text-[#DC2626]">{error}</p> : null}
    </FormDialog>
  )
}
