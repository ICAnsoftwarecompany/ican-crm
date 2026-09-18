import { useTranslation } from 'react-i18next'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { useDataSourceOptions } from '../../hooks/useDataSourceOptions'
import { MultiSelectField } from './MultiSelectField'
import { VariableTextField } from './VariableTextField'

const DEFAULT_SOURCE_BY_TYPE = {
  user: 'users',
  team: 'teams',
  template: 'whatsapp_templates',
  channel: 'outreach_channels',
}

function SelectSourceField({ field, value, onChange }) {
  const { t } = useTranslation()
  const source = field.source || DEFAULT_SOURCE_BY_TYPE[field.type]
  const { options, isLoading } = useDataSourceOptions(source)

  return (
    <Select
      label={field.labelKey ? t(field.labelKey) : undefined}
      value={value ? String(value) : ''}
      onChange={onChange}
      options={options.map((option) => ({ value: option.value, label: option.labelKey ? t(option.labelKey) : option.label }))}
      placeholder={isLoading ? t('common.loading') : t('workflow.fields.selectPlaceholder')}
    />
  )
}

/**
 * Renders one config input from a registry field definition
 * (`WorkflowFieldDefinition`, see registry/workflowRegistry.js). This is
 * the ONLY generic renderer — a module registers `fields`, it never ships
 * its own configuration dialog (see docs "Reusable Properties Panel"). A
 * custom override is only justified for a field whose UI genuinely can't
 * be expressed by this contract (documented per-field, none needed yet).
 */
export function WorkflowFieldRenderer({ field, value, onChange, variables = [] }) {
  const { t } = useTranslation()

  switch (field.type) {
    case 'text':
      return (
        <Input
          label={field.labelKey ? t(field.labelKey) : undefined}
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
        />
      )
    case 'number':
      return (
        <Input
          type="number"
          label={field.labelKey ? t(field.labelKey) : undefined}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value === '' ? '' : Number(event.target.value))}
        />
      )
    case 'boolean':
      return (
        <label className="flex items-center gap-2 text-sm font-medium text-[var(--text)]">
          <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />
          {field.labelKey ? t(field.labelKey) : null}
        </label>
      )
    case 'date':
      return (
        <Input
          type="date"
          label={field.labelKey ? t(field.labelKey) : undefined}
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
        />
      )
    case 'datetime':
      return (
        <Input
          type="datetime-local"
          label={field.labelKey ? t(field.labelKey) : undefined}
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
        />
      )
    case 'multiselect':
      return <MultiSelectField field={field} value={value} onChange={onChange} />
    case 'variable_text':
      return <VariableTextField field={field} value={value} onChange={onChange} variables={variables} />
    case 'select':
    case 'user':
    case 'team':
    case 'template':
    case 'channel':
      return <SelectSourceField field={field} value={value} onChange={onChange} />
    default:
      return <p className="text-xs text-[#EF4444]">{t('workflow.fields.unsupportedType', { type: field.type })}</p>
  }
}
