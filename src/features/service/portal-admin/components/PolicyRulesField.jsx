import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Select } from '../../../../shared/components/ui/Select'
import { cn } from '../../../../shared/utils/cn'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { FIXED_OBJECTS, actionsFor } from '../constants/portalObjects'

/**
 * Portal policy rules (spec §43.3): object + allowed actions (+ explicit deny).
 * Record / entry objects come from the tenant's record types, so the editor never hardcodes an industry.
 */
export function PolicyRulesField({ label, value = [], onChange, error, ctx }) {
  const { t, i18n } = useTranslation()
  const rows = value || []
  const recordTypes = ctx?.lists?.recordTypes?.data || []
  const objectOptions = useMemo(() => {
    const records = recordTypes.flatMap((type) => {
      const name = localizeLabel(type.label, i18n.language, type.key)
      return [
        { value: `record:${type.key}`, label: t('service.portal.objects.record', { name }) },
        ...(type.entry_types || []).map((entry) => ({ value: `record_entry:${entry.key}`, label: t('service.portal.objects.entry', { name: localizeLabel(entry.label, i18n.language, entry.key) }) })),
      ]
    })
    return [...records, ...Object.keys(FIXED_OBJECTS).map((key) => ({ value: key, label: t(`service.portal.objects.${key}`) }))]
  }, [recordTypes, i18n.language, t])
  const update = (index, patch) => onChange(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)))
  const toggle = (index, list, action) => {
    const row = rows[index]
    const current = new Set(row[list] || [])
    if (current.has(action)) current.delete(action)
    else current.add(action)
    const other = list === 'actions' ? 'deny' : 'actions'
    update(index, { [list]: [...current], [other]: (row[other] || []).filter((entry) => entry !== action) })
  }

  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1.5 text-sm font-medium text-[var(--text)]">{label}</legend>
      <p className="-mt-1 text-xs text-[var(--text-muted)]">{t('service.portal.rulesHint')}</p>
      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-[14rem_minmax(0,1fr)_auto] sm:items-center">
          <Select aria-label={t('service.portal.fields.object')} value={row.object} onChange={(object) => update(index, { object, actions: [], deny: [] })} options={objectOptions} placeholder={t('service.portal.chooseObject')} />
          <div className="flex flex-wrap gap-1.5">
            {actionsFor(row.object).map((action) => {
              const allowed = (row.actions || []).includes(action)
              const denied = (row.deny || []).includes(action)
              return (
                <span key={action} className="inline-flex overflow-hidden rounded-full border border-[var(--border)] text-xs">
                  <button type="button" aria-pressed={allowed} onClick={() => toggle(index, 'actions', action)} className={cn('px-2.5 py-1', allowed ? 'bg-status-won text-white' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]')}>
                    {t(`service.portal.actions.${action}`)}
                  </button>
                  <button type="button" aria-pressed={denied} aria-label={t('service.portal.denyAction', { action: t(`service.portal.actions.${action}`) })} onClick={() => toggle(index, 'deny', action)} className={cn('border-s border-[var(--border)] px-2 py-1', denied ? 'bg-status-lost text-white' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]')}>
                    {t('service.portal.deny')}
                  </button>
                </span>
              )
            })}
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label={t('service.settings.actions.removeRow')} onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))}>
            <Trash2 size={16} aria-hidden="true" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => onChange([...rows, { object: '', actions: [], deny: [] }])}>
        <Plus size={14} aria-hidden="true" />
        {t('service.portal.addRule')}
      </Button>
      {error && <p className="text-xs text-status-lost">{error}</p>}
    </fieldset>
  )
}
