import { useTranslation } from 'react-i18next'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { PRODUCT_KINDS } from '../../constants/catalogOptions'
import { getCategoryLabel } from '../../utils/categoryTree'
import { CheckboxField, TextAreaField, catalogInputClass, useOptions } from '../common/catalogUi'

/** Basic tab of the product form: name, kind, item type, category, price, description, image, status. */
export function ProductBasicFields({ mode, state }) {
  const { t } = useTranslation()
  const { form, errors, update, itemTypes, categories } = state
  const kindOptions = useOptions('kinds', PRODUCT_KINDS)

  const changeKind = (kind) => {
    update('kind', kind)
    update('item_type_id', '')
    update('category_id', '')
    update('capability_values', {})
  }

  return (
    <div className="space-y-4">
      <Input
        label={t('catalog.product.fields.name')}
        value={form.name}
        error={errors.name ? t(`catalog.validation.${errors.name}`) : undefined}
        onChange={(event) => update('name', event.target.value)}
        autoFocus
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label={t('catalog.product.fields.kind')}
          value={form.kind}
          options={kindOptions}
          disabled={mode === 'edit'}
          onChange={(value) => changeKind(value || 'product')}
        />
        <Select
          label={t('catalog.product.fields.itemType')}
          value={form.item_type_id}
          placeholder={t('catalog.product.noItemType')}
          options={itemTypes.map((itemType) => ({ value: String(itemType.id), label: itemType.name }))}
          onChange={(value) => {
            update('item_type_id', value)
            update('capability_values', {})
          }}
        />
      </div>
      {mode === 'edit' && <p className="-mt-2 text-xs text-[var(--text-muted)]">{t('catalog.product.kindLocked')}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t('catalog.product.fields.price')}
          type="number"
          min={0}
          step="any"
          dir="ltr"
          value={form.price}
          error={errors.price ? t(`catalog.validation.${errors.price}`) : undefined}
          onChange={(event) => update('price', event.target.value)}
        />
        <Select
          label={t('catalog.product.fields.category')}
          value={form.category_id}
          placeholder={t('catalog.product.noCategory')}
          options={categories.map((category) => ({ value: String(category.id), label: category._pathLabel || getCategoryLabel(category) }))}
          onChange={(value) => update('category_id', value)}
        />
      </div>

      <TextAreaField
        label={t('catalog.product.fields.description')}
        value={form.description}
        onChange={(value) => update('description', value)}
      />

      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--text)]">
        {t('catalog.product.fields.image')}
        <input
          type="file"
          accept="image/*"
          className={catalogInputClass}
          onChange={(event) => update('image', event.target.files?.[0] || null)}
        />
        {mode === 'edit' && <span className="text-xs font-normal text-[var(--text-muted)]">{t('catalog.product.imageKeep')}</span>}
      </label>

      <CheckboxField label={t('catalog.product.fields.active')} checked={form.status} onChange={(value) => update('status', value)} />
    </div>
  )
}
