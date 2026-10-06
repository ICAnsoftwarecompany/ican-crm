import { useTranslation } from 'react-i18next'
import { Select } from '../../../../shared/components/ui/Select'
import { EmptyState } from '../../../../shared/components/feedback/EmptyState'
import { FULFILLMENT_CREATES } from '../../constants/catalogOptions'
import { CapabilityConfigFields } from '../common/CapabilityConfigFields'
import { useCapabilityName, useOptionLabel, useOptions } from '../common/catalogUi'

/**
 * Capabilities tab: per-product overrides of the item type's capability config (`capability_values`) and of
 * `fulfillment_config.creates`. Blank fields inherit the item type's value (shown as placeholder).
 */
export function ProductCapabilityFields({ state }) {
  const { t } = useTranslation()
  const capabilityName = useCapabilityName()
  const optionLabel = useOptionLabel()
  const createsOptions = useOptions('creates', FULFILLMENT_CREATES)
  const { form, update, selectedItemType, setCapabilityValue } = state

  if (!selectedItemType) {
    return <EmptyState title={t('catalog.product.capabilitiesNeedType')} description={t('catalog.product.capabilitiesNeedTypeHint')} />
  }

  const inheritedCreates = selectedItemType.fulfillmentConfig?.creates

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text-muted)]">{t('catalog.product.capabilitiesHint', { type: selectedItemType.name })}</p>

      {selectedItemType.capabilities.map((capability) => (
        <section key={capability.code} className="space-y-3 rounded-lg border border-[var(--border)] p-3">
          <h3 className="text-sm font-semibold text-[var(--text)]">{capabilityName(capability.code)}</h3>
          <CapabilityConfigFields
            code={capability.code}
            value={form.capability_values?.[capability.code] || {}}
            defaults={capability.config}
            onChange={(config) => setCapabilityValue(capability.code, config)}
          />
        </section>
      ))}
      {!selectedItemType.capabilities.length && <p className="text-sm text-[var(--text-muted)]">{t('catalog.itemTypes.noCapabilities')}</p>}

      <Select
        label={t('catalog.product.fields.fulfillmentCreates')}
        value={form.fulfillment_creates}
        placeholder={inheritedCreates
          ? t('catalog.capabilities.defaultValue', { value: optionLabel('creates', inheritedCreates) })
          : t('common.choose')}
        options={createsOptions}
        onChange={(value) => update('fulfillment_creates', value)}
      />
    </div>
  )
}
