import { useTranslation } from 'react-i18next'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { getCapabilityDefinition } from '../../constants/capabilityRegistry'
import { CheckboxField, useOptionLabel } from './catalogUi'

/**
 * Inputs for one capability's config, from the registry (2026-10-06).
 * `defaults` (the item type's config) show as placeholders when editing a product's override values.
 */
export function CapabilityConfigFields({ code, value = {}, defaults = {}, onChange }) {
  const { t } = useTranslation()
  const optionLabel = useOptionLabel()
  const fields = getCapabilityDefinition(code)?.fields || []

  if (!fields.length) {
    return <p className="text-xs text-[var(--text-muted)]">{t('catalog.capabilities.noSettings')}</p>
  }

  const set = (key, next) => onChange({ ...value, [key]: next })
  const fieldLabel = (key) => t(`catalog.capabilities.fields.${key}`)
  const placeholderFor = (field) => {
    const fallback = defaults?.[field.key]
    if (fallback !== undefined && fallback !== null && fallback !== '') {
      return t('catalog.capabilities.defaultValue', { value: field.type === 'select' ? optionLabel(`capability_${field.key}`, fallback) : String(fallback) })
    }
    return field.placeholder
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map((field) => {
        if (field.type === 'boolean') {
          const current = value[field.key] ?? defaults?.[field.key] ?? false
          return (
            <div key={field.key} className="sm:col-span-2">
              <CheckboxField label={fieldLabel(field.key)} checked={current === true || current === 'true'} onChange={(next) => set(field.key, next)} />
            </div>
          )
        }
        if (field.type === 'select') {
          return (
            <Select
              key={field.key}
              label={fieldLabel(field.key)}
              value={value[field.key] ?? ''}
              placeholder={placeholderFor(field) || t('common.choose')}
              options={field.options.map((option) => ({ value: option, label: optionLabel(`capability_${field.key}`, option) }))}
              onChange={(next) => set(field.key, next)}
            />
          )
        }
        return (
          <Input
            key={field.key}
            label={fieldLabel(field.key)}
            type={field.type === 'number' ? 'number' : 'text'}
            dir={field.type === 'text' ? 'ltr' : undefined}
            min={field.type === 'number' ? 0 : undefined}
            value={value[field.key] ?? ''}
            placeholder={placeholderFor(field)}
            onChange={(event) => set(field.key, event.target.value)}
          />
        )
      })}
    </div>
  )
}
