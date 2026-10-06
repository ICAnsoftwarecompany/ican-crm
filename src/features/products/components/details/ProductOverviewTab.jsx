import { useTranslation } from 'react-i18next'
import { getCapabilityDefinition } from '../../constants/capabilityRegistry'
import { getCategoryLabel } from '../../utils/categoryTree'
import { parseAdditionalData } from '../common/AdditionalDataFields'
import { ActiveBadge, KindBadge, useCapabilityName, useNumberFormat, useOptionLabel } from '../common/catalogUi'
import { formatDate } from '../../../../shared/utils/dateTime'

function Detail({ label, children }) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="text-xs font-semibold text-[var(--text-muted)]">{label}</div>
      <div className="mt-1 break-words text-sm text-[var(--text)]">{children || '—'}</div>
    </div>
  )
}

/** Effective config of a capability: the item type's config overridden by the product's values. */
function useConfigText() {
  const { t } = useTranslation()
  const optionLabel = useOptionLabel()
  return (code, config) => {
    const fields = new Map((getCapabilityDefinition(code)?.fields || []).map((field) => [field.key, field]))
    const parts = Object.entries(config || {}).map(([key, value]) => {
      const field = fields.get(key)
      const label = field ? t(`catalog.capabilities.fields.${key}`) : key
      let text = String(value)
      if (field?.type === 'boolean') text = value ? t('catalog.common.yes') : t('catalog.common.no')
      if (field?.type === 'select') text = optionLabel(`capability_${key}`, value)
      return `${label}: ${text}`
    })
    return parts.length ? parts.join(' · ') : t('catalog.capabilities.noSettings')
  }
}

/** General information of a product (2026-10-06). */
export function ProductOverviewTab({ product, itemType }) {
  const { t, i18n } = useTranslation()
  const formatNumber = useNumberFormat()
  const capabilityName = useCapabilityName()
  const optionLabel = useOptionLabel()
  const configText = useConfigText()
  const additional = parseAdditionalData(product.data)
  const creates = product.fulfillmentConfig?.creates || itemType?.fulfillmentConfig?.creates
  const date = (value) => (value ? formatDate(value, i18n.language, { dateStyle: 'medium' }) : '')

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Detail label={t('catalog.product.fields.kind')}><KindBadge kind={product.kind} /></Detail>
        <Detail label={t('catalog.product.fields.itemType')}>{itemType?.name}</Detail>
        <Detail label={t('catalog.product.fields.category')}>{product.category ? getCategoryLabel(product.category) : ''}</Detail>
        <Detail label={t('catalog.columns.status')}><ActiveBadge active={product.status} /></Detail>
        <Detail label={t('catalog.product.fields.price')}><span dir="ltr">{formatNumber(product.price)}</span></Detail>
        <Detail label={t('catalog.product.fields.stockQuantity')}>
          {product.isStockTracked ? <span dir="ltr">{formatNumber(product.stockQuantity)}</span> : t('catalog.product.notTracked')}
        </Detail>
        <Detail label={t('catalog.product.fields.baseUnit')}>{product.baseUnit?.name || product.baseUnit?.code}</Detail>
        <Detail label={t('catalog.product.fields.fulfillmentCreates')}>{creates ? optionLabel('creates', creates) : ''}</Detail>
        <Detail label={t('catalog.columns.createdAt')}>{date(product.createdAt)}</Detail>
        <Detail label={t('catalog.columns.updatedAt')}>{date(product.updatedAt)}</Detail>
      </div>

      {product.description && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-[var(--text)]">{t('catalog.product.fields.description')}</h3>
          <p className="whitespace-pre-wrap text-sm text-[var(--text-muted)]">{product.description}</p>
        </section>
      )}

      <section>
        <h3 className="mb-2 text-sm font-semibold text-[var(--text)]">{t('catalog.product.tabs.capabilities')}</h3>
        {itemType?.capabilities?.length ? (
          <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
            {itemType.capabilities.map((capability) => (
              <li key={capability.code} className="flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium text-[var(--text)]">{capabilityName(capability.code)}</span>
                <span className="text-xs text-[var(--text-muted)]">
                  {configText(capability.code, { ...capability.config, ...(product.capabilityValues?.[capability.code] || {}) })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">{itemType ? t('catalog.itemTypes.noCapabilities') : t('catalog.product.capabilitiesNeedType')}</p>
        )}
      </section>

      {additional.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-[var(--text)]">{t('catalog.product.tabs.additional')}</h3>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {additional.map((row) => <Detail key={row.id} label={row.name}>{row.value}</Detail>)}
          </div>
        </section>
      )}
    </div>
  )
}
