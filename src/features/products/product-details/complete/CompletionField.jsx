import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { getCategoryLabel } from '../../utils/categoryTree'
import { TextAreaField, catalogInputClass } from '../../components/common/catalogUi'
import { HelpField } from '../../components/common/HelpTip'
import { ProductCapabilityFields } from '../../components/products/ProductCapabilityFields'
import { QuickItemTypeDialog } from '../../item-type-wizard'
import { CategoryDetails, QuickCategoryDialog, TypeSummaryCard } from '../../product-create'

/** The one field a completion step fills (2026-10-15). `state` = useProductForm of the product being completed. */
export function CompletionField({ step, state, error }) {
  const { t } = useTranslation()
  const [dialog, setDialog] = useState(null)
  const { form, update, itemTypes, categories } = state
  const help = (key) => ({ title: t(`productSetup.help.${key}.title`), text: t(`productSetup.help.${key}.text`) })
  const fieldError = error ? t(`catalog.validation.${error}`) : undefined

  if (step === 'name') {
    return <HelpField {...help('name')}><Input label={t('catalog.product.fields.name')} value={form.name} autoFocus error={fieldError} onChange={(event) => update('name', event.target.value)} /></HelpField>
  }
  if (step === 'price') {
    return <HelpField {...help('price')}><Input label={t('catalog.product.fields.price')} type="number" min={0} step="any" dir="ltr" value={form.price} autoFocus error={fieldError} onChange={(event) => update('price', event.target.value)} /></HelpField>
  }
  if (step === 'description') {
    return <HelpField {...help('description')}><TextAreaField label={t('catalog.product.fields.description')} rows={4} value={form.description} onChange={(value) => update('description', value)} /></HelpField>
  }
  if (step === 'image') {
    return (
      <HelpField {...help('image')}>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text)]">
          {t('catalog.product.fields.image')}
          <input type="file" accept="image/*" className={catalogInputClass} onChange={(event) => update('image', event.target.files?.[0] || null)} />
          {form.image && <span className="text-xs font-normal text-[var(--text-muted)]">{form.image.name}</span>}
        </label>
      </HelpField>
    )
  }
  if (step === 'capabilities') return <ProductCapabilityFields state={state} />
  if (step === 'itemType') {
    return (
      <div className="space-y-3">
        <HelpField {...help('itemType')} className="space-y-1">
          <Select
            label={t('catalog.product.fields.itemType')}
            value={form.item_type_id}
            placeholder={t('catalog.product.noItemType')}
            options={itemTypes.map((itemType) => ({ value: String(itemType.id), label: itemType.name }))}
            onChange={(value) => { update('item_type_id', value); update('capability_values', {}) }}
          />
          <Button variant="ghost" size="sm" onClick={() => setDialog('type')}><Plus size={14} />{t('productSetup.quickType.open')}</Button>
        </HelpField>
        <TypeSummaryCard itemType={form.item_type_id ? state.selectedItemType : null} loading={Boolean(form.item_type_id) && state.isLoadingItemType} />
        <p className="text-xs text-[var(--text-muted)]">{t('productDetails.complete.itemTypeNote')}</p>
        <QuickItemTypeDialog
          open={dialog === 'type'}
          kind={form.kind}
          onClose={() => setDialog(null)}
          onSaved={(id) => id && update('item_type_id', String(id))}
        />
      </div>
    )
  }
  if (step === 'category') {
    return (
      <div className="space-y-3">
        <HelpField {...help('category')} className="space-y-1">
          <Select
            label={t('catalog.product.fields.category')}
            value={form.category_id}
            placeholder={t('catalog.product.noCategory')}
            options={categories.map((category) => ({ value: String(category.id), label: category._pathLabel || getCategoryLabel(category) }))}
            onChange={(value) => update('category_id', value)}
          />
          <Button variant="ghost" size="sm" onClick={() => setDialog('category')}><Plus size={14} />{t('productSetup.quickCategory.open')}</Button>
        </HelpField>
        <CategoryDetails categories={categories} categoryId={form.category_id} />
        <QuickCategoryDialog
          open={dialog === 'category'}
          kind={form.kind}
          categories={categories}
          parentId={form.category_id}
          onClose={() => setDialog(null)}
          onSaved={(id) => id && update('category_id', String(id))}
        />
      </div>
    )
  }
  return null
}
