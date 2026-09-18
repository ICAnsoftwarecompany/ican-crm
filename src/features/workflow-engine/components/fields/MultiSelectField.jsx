import { useTranslation } from 'react-i18next'
import { useDataSourceOptions } from '../../hooks/useDataSourceOptions'

export function MultiSelectField({ field, value = [], onChange }) {
  const { t } = useTranslation()
  const { options, isLoading } = useDataSourceOptions(field.source)
  const selected = new Set((value || []).map(String))

  const toggle = (optionValue) => {
    const idStr = String(optionValue)
    const next = selected.has(idStr) ? value.filter((item) => String(item) !== idStr) : [...value, optionValue]
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-1.5">
      {field.labelKey && <span className="text-sm font-medium font-arabic text-[var(--text)]">{t(field.labelKey)}</span>}
      <div className="max-h-40 overflow-y-auto rounded-lg border border-[var(--border)] p-2">
        {isLoading && <p className="text-xs text-[var(--text-muted)]">{t('common.loading')}</p>}
        {!isLoading && options.length === 0 && <p className="text-xs text-[var(--text-muted)]">{t('workflow.fields.noOptions')}</p>}
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 rounded px-1 py-1 text-sm hover:bg-[var(--surface-2)]">
            <input type="checkbox" checked={selected.has(String(option.value))} onChange={() => toggle(option.value)} />
            <span>{option.labelKey ? t(option.labelKey) : option.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
