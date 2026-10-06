import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { Button } from '../../../../shared/components/ui/Button'
import { Tabs } from '../../../../shared/components/ui/Tabs'
import { useCatalogProductMutations } from '../../hooks/useCatalogProducts'
import { buildProductPayload } from '../../utils/catalogForms'
import { getCreatedId } from '../../utils/catalogPayloads'
import { formatApiError } from '../../utils/apiErrors'
import { AdditionalDataFields, getAdditionalFieldNames, serializeAdditionalData } from '../common/AdditionalDataFields'
import { FormError } from '../common/catalogUi'
import { ProductBasicFields } from './ProductBasicFields'
import { ProductCapabilityFields } from './ProductCapabilityFields'
import { ProductStockFields } from './ProductStockFields'
import { useProductForm } from './useProductForm'

/**
 * Create / edit a product or service (2026-10-06): basic data, stock & alternative units (create only),
 * capability overrides of its item type, and the free "additional data" fields.
 * `onSaved(id)` receives the product id (the created one on create).
 */
export function ProductFormDrawer({ open, mode = 'create', product = null, kind = 'product', onClose, onSaved }) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('basic')
  const [submitError, setSubmitError] = useState('')
  const state = useProductForm({ open, product, kind })
  const mutations = useCatalogProductMutations()
  const saving = mutations.create.isPending || mutations.update.isPending
  const entity = t(`catalog.entity.${state.form.kind}`, { defaultValue: t('catalog.entity.product') })

  const handleClose = () => {
    setActiveTab('basic')
    setSubmitError('')
    onClose?.()
  }

  const submit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    const errors = state.validate()
    if (Object.keys(errors).length) {
      setActiveTab(errors.name || errors.price ? 'basic' : 'stock')
      return
    }
    const payload = buildProductPayload(state.form, { mode, data: serializeAdditionalData(state.additionalRows) })
    try {
      if (mode === 'create') {
        const response = await mutations.create.mutateAsync(payload)
        toast.success(t('catalog.product.created', { entity }))
        onSaved?.(getCreatedId(response))
      } else {
        await mutations.update.mutateAsync({ id: product.id, payload })
        toast.success(t('catalog.product.updated', { entity }))
        onSaved?.(product.id)
      }
      handleClose()
    } catch (error) {
      setSubmitError(formatApiError(error, t('catalog.product.saveFailed')))
    }
  }

  const tabs = [
    { id: 'basic', label: t('catalog.product.tabs.basic'), content: <ProductBasicFields mode={mode} state={state} /> },
    { id: 'stock', label: t('catalog.product.tabs.stock'), content: <ProductStockFields mode={mode} state={state} /> },
    { id: 'capabilities', label: t('catalog.product.tabs.capabilities'), content: <ProductCapabilityFields state={state} /> },
    {
      id: 'additional',
      label: t('catalog.product.tabs.additional'),
      content: (
        <AdditionalDataFields
          rows={state.additionalRows}
          onChange={state.setAdditionalRows}
          suggestions={getAdditionalFieldNames(state.categories.find((category) => String(category.id) === String(state.form.category_id))?.data)}
        />
      ),
    },
  ]

  return (
    <AppDrawer
      open={open}
      onClose={handleClose}
      size="lg"
      title={mode === 'create' ? t('catalog.product.addTitle', { entity }) : t('catalog.product.editTitle', { entity })}
      description={t('catalog.product.drawerDescription')}
    >
      <form onSubmit={submit} className="flex min-h-[calc(100vh-7.5rem)] flex-col gap-4">
        <FormError message={submitError} />
        <Tabs items={tabs} active={activeTab} onChange={setActiveTab} variant="underline" />
        <div className="mt-auto flex items-center justify-end gap-2 border-t border-[var(--border)] pt-4">
          <Button variant="outline" onClick={handleClose} disabled={saving}>{t('actions.cancel')}</Button>
          <Button type="submit" loading={saving}>{mode === 'create' ? t('catalog.product.addTitle', { entity }) : t('catalog.common.saveChanges')}</Button>
        </div>
      </form>
    </AppDrawer>
  )
}
