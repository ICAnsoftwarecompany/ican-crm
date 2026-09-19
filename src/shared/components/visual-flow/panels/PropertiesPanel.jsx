import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { Input } from '../../ui/Input'
import { Select } from '../../ui/Select'

function GenericField({ field, value, onChange, resolveFieldOptions }) {
  const { t } = useTranslation()
  const label = field.labelKey ? t(field.labelKey) : undefined

  if (field.type === 'custom') {
    if (!field.component) return null
    const Custom = field.component
    return <Custom field={field} value={value} onChange={onChange} />
  }

  if (field.type === 'textarea') {
    return (
      <label className="flex flex-col gap-1.5">
        {label && <span className="text-sm font-medium text-[var(--text)]">{label}</span>}
        <textarea
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-[#00C2CB]"
        />
      </label>
    )
  }

  if (field.type === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-sm font-medium text-[var(--text)]">
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />
        {label}
      </label>
    )
  }

  if (['select', 'multiselect', 'user', 'team', 'entity', 'template'].includes(field.type)) {
    const dynamic = field.source ? resolveFieldOptions?.(field.source) : null
    const options = field.options || dynamic?.options || []
    const isLoading = dynamic?.isLoading

    if (field.type === 'multiselect') {
      const selected = new Set((value || []).map(String))
      return (
        <div className="flex flex-col gap-1.5">
          {label && <span className="text-sm font-medium text-[var(--text)]">{label}</span>}
          <div className="max-h-40 overflow-y-auto rounded-lg border border-[var(--border)] p-2">
            {options.map((option) => (
              <label key={option.value} className="flex items-center gap-2 rounded px-1 py-1 text-sm hover:bg-[var(--surface-2)]">
                <input
                  type="checkbox"
                  checked={selected.has(String(option.value))}
                  onChange={() => {
                    const idStr = String(option.value)
                    onChange(selected.has(idStr) ? (value || []).filter((item) => String(item) !== idStr) : [...(value || []), option.value])
                  }}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      )
    }

    return (
      <Select
        label={label}
        value={value ? String(value) : ''}
        onChange={onChange}
        options={options}
        placeholder={isLoading ? t('common.loading') : t('visualFlow.properties.selectPlaceholder')}
      />
    )
  }

  if (field.type === 'date' || field.type === 'datetime') {
    return (
      <Input
        type={field.type === 'date' ? 'date' : 'datetime-local'}
        label={label}
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
      />
    )
  }

  if (field.type === 'duration') {
    return <Input type="number" label={label} value={value ?? ''} onChange={(event) => onChange(event.target.value === '' ? '' : Number(event.target.value))} />
  }

  if (field.type === 'number') {
    return <Input type="number" label={label} value={value ?? ''} onChange={(event) => onChange(event.target.value === '' ? '' : Number(event.target.value))} />
  }

  return <Input label={label} value={value || ''} onChange={(event) => onChange(event.target.value)} />
}

/**
 * Renders `definition.properties` for the selected node — this is the
 * whole reason nodes stay visually simple (see docs "Properties Panel").
 * A domain module never ships its own configuration dialog; it ships a
 * `properties` array, VisualFlow renders the form. `resolveFieldOptions`
 * is how the CONSUMING feature answers "what are the options for source
 * X" — VisualFlow core never fetches data itself (mirrors the same
 * boundary the Workflow Engine draws around `useDataSourceOptions`).
 */
export function PropertiesPanel({ node, nodeRegistry, onChange, onClose, resolveFieldOptions, readOnly = false }) {
  const { t } = useTranslation()

  if (!node) {
    return <p className="p-4 text-sm text-[var(--text-muted)]">{t('visualFlow.properties.emptyHint')}</p>
  }

  const definition = nodeRegistry?.get(node.type)
  const fields = definition?.properties || []

  return (
    <div className="p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="min-w-0 truncate text-sm font-black text-[var(--text)]">{definition ? t(definition.labelKey) : node.type}</h3>
        {onClose && (
          <button type="button" onClick={onClose} aria-label={t('actions.close')}>
            <X size={16} />
          </button>
        )}
      </div>

      {definition?.descriptionKey && <p className="mb-3 text-xs text-[var(--text-muted)]">{t(definition.descriptionKey)}</p>}

      {fields.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)]">{t('visualFlow.properties.noFields')}</p>
      ) : (
        <div className="space-y-3">
          {fields.map((field) => (
            <fieldset key={field.key} disabled={readOnly}>
              <GenericField
                field={field}
                value={node.data?.[field.key]}
                onChange={(value) => onChange?.(node.id, { [field.key]: value })}
                resolveFieldOptions={resolveFieldOptions}
              />
            </fieldset>
          ))}
        </div>
      )}
    </div>
  )
}
