import { useTranslation } from 'react-i18next'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { CheckboxGroupField, SwitchField } from '../../settings/components/fields/ResourceField'

/**
 * Renders a capability's `config_fields` from the registry. Labels:
 * `service.capabilities.<code>.fields.<key>`; option labels: `service.capabilities.options.<value>`.
 */
export function CapabilityConfigFields({ entry, config = {}, onChange }) {
  const { t } = useTranslation()
  const set = (key) => (next) => onChange({ ...config, [key]: next })
  const option = (value) => ({ value, label: t(`service.capabilities.options.${value}`, { defaultValue: value }) })

  if (!entry?.config_fields?.length) return null
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {entry.config_fields.map((field) => {
        const label = t(`service.capabilities.${entry.code}.fields.${field.key}`)
        const value = config[field.key] ?? field.default
        switch (field.type) {
          case 'number':
            return (
              <Input
                key={field.key}
                label={label}
                type="number"
                dir="ltr"
                min={field.min}
                value={value ?? ''}
                onChange={(event) => set(field.key)(event.target.value === '' ? null : Number(event.target.value))}
              />
            )
          case 'select':
            return <Select key={field.key} label={label} value={value ?? ''} options={(field.options || []).map(option)} onChange={(next) => set(field.key)(next || field.default)} />
          case 'multiselect':
            return (
              <div key={field.key} className="sm:col-span-2">
                <CheckboxGroupField label={label} value={value || []} options={(field.options || []).map(option)} onChange={set(field.key)} />
              </div>
            )
          case 'switch':
            return <SwitchField key={field.key} label={label} value={value} onChange={set(field.key)} />
          default:
            return <Input key={field.key} label={label} dir={field.ltr ? 'ltr' : 'auto'} value={value ?? ''} onChange={(event) => set(field.key)(event.target.value)} />
        }
      })}
    </div>
  )
}
