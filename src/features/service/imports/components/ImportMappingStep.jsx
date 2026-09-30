import { useTranslation } from 'react-i18next'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { localizeLabel } from '../../core/utils/localizeLabel'

/** Column → field mapping with a sample value per column, import mode and match key. */
export function ImportMappingStep({ file, fields, mapping, onMapping, mode, onMode, matchKey, onMatchKey, mappingName, onMappingName, savedMappings, onApplySaved }) {
  const { t, i18n } = useTranslation()
  const fieldLabel = (field) => (field.label ? localizeLabel(field.label, i18n.language, field.key) : t(`service.imports.fields.${field.key}`))
  const mapped = new Set(Object.values(mapping).filter(Boolean))
  const missingRequired = fields.filter((field) => field.required && !mapped.has(field.key))
  const matchable = fields.filter((field) => field.matchable)

  return (
    <div className="grid gap-4">
      {savedMappings.length > 0 && (
        <div className="w-full sm:w-72">
          <Select label={t('service.imports.savedMapping')} placeholder={t('service.imports.chooseSaved')} value="" onChange={(id) => onApplySaved(savedMappings.find((entry) => entry.id === id))} options={savedMappings.map((entry) => ({ value: entry.id, label: entry.name }))} />
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-xs text-[var(--text-muted)]">
            <tr>
              <th className="px-3 py-2 text-start font-medium">{t('service.imports.column')}</th>
              <th className="px-3 py-2 text-start font-medium">{t('service.imports.sample')}</th>
              <th className="px-3 py-2 text-start font-medium">{t('service.imports.field')}</th>
            </tr>
          </thead>
          <tbody>
            {file.headers.map((header, index) => (
              <tr key={header} className="border-t border-[var(--border)]">
                <td className="px-3 py-1.5 font-medium"><bdi>{header}</bdi></td>
                <td className="max-w-[16rem] truncate px-3 py-1.5 text-xs text-[var(--text-muted)]"><bdi>{file.sample[0]?.[index] ?? ''}</bdi></td>
                <td className="w-72 px-3 py-1.5">
                  <Select aria-label={t('service.imports.fieldFor', { column: header })} placeholder={t('service.imports.skip')} value={mapping[header] || ''} onChange={(value) => onMapping({ ...mapping, [header]: value || '' })} options={fields.filter((field) => !mapped.has(field.key) || mapping[header] === field.key).map((field) => ({ value: field.key, label: `${fieldLabel(field)}${field.required ? ' *' : ''}` }))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {missingRequired.length > 0 && <p className="text-xs text-sla-at-risk">{t('service.imports.missingRequired', { fields: missingRequired.map(fieldLabel).join(' · ') })}</p>}
      <div className="grid gap-3 sm:grid-cols-3">
        <Select label={t('service.imports.mode')} value={mode} onChange={(value) => onMode(value || 'create')} options={['create', 'upsert'].map((value) => ({ value, label: t(`service.imports.modes.${value}`) }))} />
        <Select label={t('service.imports.matchKey')} placeholder={t('service.imports.noMatchKey')} value={matchKey} onChange={onMatchKey} options={matchable.map((field) => ({ value: field.key, label: fieldLabel(field) }))} />
        <Input label={t('service.imports.saveMappingAs')} dir="auto" value={mappingName} onChange={(event) => onMappingName(event.target.value)} />
      </div>
      <p className="text-xs text-[var(--text-muted)]">{t(`service.imports.modeHints.${mode}`)}</p>
    </div>
  )
}
