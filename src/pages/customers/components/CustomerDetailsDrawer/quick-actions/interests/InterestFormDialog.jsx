import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { useLeadMutations } from '../../../../../../features/leads/hooks/useLeads'
import { useProducts } from '../../../../../../features/products/hooks/useProducts'
import { FormDialog } from '../../../../../../shared/components/overlays/FormDialog'
import { extractMessage } from '../../../../../../shared/utils/apiResponse'
import { useTranslation } from 'react-i18next'

const INTEREST_LEVELS = [
  { value: 'high', labelKey: 'activities.priority.high' },
  { value: 'medium', labelKey: 'activities.priority.medium' },
  { value: 'low', labelKey: 'activities.priority.low' },
]

function getLeadId(customer) {
  return customer?.lead_id || customer?.lead?.id
}

function getCustomerName(customer, t) {
  return customer?.name || customer?.lead?.name || customer?.email || customer?.phone || t('customers.table.theCustomer')
}

function getProductLabel(product, t) {
  return [
    product?.name || t('customers.activityTimeline.productNumber', { id: product?.id || '' }),
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
  const { t } = useTranslation()
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
      setError(t('customers.interestForm.noLead'))
      return
    }

    if (!productId) {
      setError(t('customers.interestForm.chooseProductFirst'))
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

      toast.success(isEdit ? t('customers.interestForm.updated') : t('customers.interestForm.added'))
      onSaved?.(response, payload)
      onClose?.()
    } catch (requestError) {
      toast.error(extractMessage(requestError, isEdit ? t('customers.interestForm.updateFailed') : t('customers.interestForm.addFailed')))
    }
  }

  const loading = mutations.saveInterested.isPending || mutations.updateInterested.isPending

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={isEdit ? t('customers.interestForm.editTitle') : t('customers.interestForm.addTitle')}
      description={t('customers.interestForm.customerLabel', { name: getCustomerName(customer, t) })}
      onSubmit={handleSubmit}
      submitText={isEdit ? t('customers.interestForm.saveChanges') : t('customers.interestForm.submitAdd')}
      loading={loading}
      submitDisabled={!leadId || !productId}
      size="lg"
      className="max-w-2xl"
    >
      <label className="grid gap-1.5 text-sm font-bold text-[var(--text)]">
        <span>{t('customers.interestForm.product')}</span>
        <select
          value={productId}
          onChange={(event) => {
            setProductId(event.target.value)
            if (error) setError('')
          }}
          disabled={productsQuery.isLoading || loading}
          className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm font-semibold text-[var(--text)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
        >
          <option value="">{productsQuery.isLoading ? t('customers.productsDialog.loadingProducts') : t('customers.interestForm.chooseProduct')}</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {getProductLabel(product, t)}
            </option>
          ))}
        </select>
      </label>

      {selectedProduct ? (
        <div className="rounded-xl border border-[#E5F7F8] bg-[#F8FEFF] p-3 text-xs font-bold text-[var(--text-muted)]">
          {selectedProduct.desc || selectedProduct.description || selectedProduct.code || t('customers.interestForm.productSelected')}
        </div>
      ) : null}

      <label className="grid gap-1.5 text-sm font-bold text-[var(--text)]">
        <span>{t('customers.interestForm.interestLevel')}</span>
        <select
          value={interestLevel}
          onChange={(event) => setInterestLevel(event.target.value)}
          disabled={loading}
          className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm font-semibold text-[var(--text)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
        >
          {INTEREST_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {t(level.labelKey)}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5 text-sm font-bold text-[var(--text)]">
        <span>{t('customers.interestForm.note')}</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={4}
          disabled={loading}
          className="w-full resize-y rounded-lg border border-[var(--border)] bg-white p-3 text-sm font-semibold text-[var(--text)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
          placeholder={t('customers.interestForm.notePlaceholder')}
        />
      </label>

      {error ? <p className="text-xs font-bold text-[#DC2626]">{error}</p> : null}
    </FormDialog>
  )
}
