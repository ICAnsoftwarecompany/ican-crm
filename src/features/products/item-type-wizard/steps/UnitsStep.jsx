import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Info, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { newTypeUnitRow } from '../utils/itemTypeForm'
import { CheckboxField } from '../../components/common/catalogUi'
import { HelpField } from '../components/HelpTip'
import { UnitFormDialog } from '../../components/units/UnitFormDialog'

const SUGGESTED_UNIT_TYPES = { hour: 'time' }

/**
 * Step 4 (types sold in units): alternative units every product of this type starts with, e.g. box = 10 pieces.
 * Prices and barcodes stay per product. Units suggested by a template that the tenant lacks can be created here.
 */
export function UnitsStep({ wizard }) {
  const { t } = useTranslation()
  const { form, update, errors, units, unitsLoading, missingUnits, addCreatedUnit } = wizard
  const [dialog, setDialog] = useState(null) // { initial, suggestion } | null
  const unitOptions = useMemo(() => units
    .filter((unit) => unit.status !== false)
    .map((unit) => ({ value: String(unit.id), label: `${unit.name} (${unit.code})` })), [units])
  const help = (key) => ({ title: t(`catalogSetup.typeWizard.help.${key}.title`), text: t(`catalogSetup.typeWizard.help.${key}.text`) })

  const setRow = (key, patch) => update({ units: form.units.map((row) => (row.key === key ? { ...row, ...patch } : row)) })
  const setDefault = (key, on) => update({ units: form.units.map((row) => ({ ...row, is_default: row.key === key ? on : on ? false : row.is_default })) })
  const openSuggestion = (suggestion) => setDialog({
    suggestion,
    initial: { code: suggestion.code, name: t(`catalogSetup.typeWizard.unitNames.${suggestion.code}`), type: SUGGESTED_UNIT_TYPES[suggestion.code] || 'count' },
  })

  return (
    <div className="space-y-4">
      <p className="flex items-start gap-2 rounded-lg bg-[var(--surface-2)] p-3 text-sm text-[var(--text)]">
        <Info size={16} className="mt-0.5 shrink-0 text-[var(--brand-accent)]" aria-hidden="true" />
        {t(`catalogSetup.typeWizard.units.baseNote.${form.kind === 'service' ? 'service' : 'product'}`)}
      </p>

      {missingUnits.length > 0 && (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-3">
          <p className="mb-2 text-sm text-[var(--text)]">{t('catalogSetup.typeWizard.units.missing')}</p>
          <div className="flex flex-wrap gap-2">
            {missingUnits.map((suggestion) => (
              <Button key={suggestion.code} variant="outline" size="sm" onClick={() => openSuggestion(suggestion)}>
                <Plus size={14} />
                {t('catalogSetup.typeWizard.units.createSuggested', { name: t(`catalogSetup.typeWizard.unitNames.${suggestion.code}`), factor: suggestion.factor })}
              </Button>
            ))}
          </div>
        </div>
      )}

      {!form.units.length && <p className="text-sm text-[var(--text-muted)]">{t('catalogSetup.typeWizard.units.empty')}</p>}

      {form.units.map((row) => (
        <div key={row.key} className="space-y-2 rounded-lg border border-[var(--border)] p-3">
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto_auto] sm:items-end">
            <HelpField {...help('unit')}>
              <Select
                label={t('catalogSetup.typeWizard.units.unit')}
                value={row.unit_id}
                placeholder={unitsLoading ? t('catalog.common.loading') : t('catalogSetup.typeWizard.units.pickUnit')}
                options={unitOptions}
                onChange={(value) => setRow(row.key, { unit_id: value })}
              />
            </HelpField>
            <HelpField {...help('factor')}>
              <Input
                label={t('catalogSetup.typeWizard.units.factor')}
                type="number"
                min={0}
                step="any"
                dir="ltr"
                value={row.factor}
                onChange={(event) => setRow(row.key, { factor: event.target.value })}
              />
            </HelpField>
            <div className="pb-2">
              <CheckboxField label={t('catalogSetup.typeWizard.units.default')} checked={row.is_default} onChange={(value) => setDefault(row.key, value)} />
            </div>
            <Button variant="ghost" size="icon" onClick={() => update({ units: form.units.filter((item) => item.key !== row.key) })} aria-label={t('catalog.common.remove')}>
              <Trash2 size={16} />
            </Button>
          </div>
          {row.unit_id && Number(row.factor) > 0 && (
            <p className="text-xs text-[var(--text-muted)]">
              {t('catalogSetup.typeWizard.units.example', { unit: unitOptions.find((option) => option.value === row.unit_id)?.label || '', factor: row.factor })}
            </p>
          )}
          {errors[`units.${row.key}`] && <p className="text-xs text-[#EF4444]">{t(`catalog.validation.${errors[`units.${row.key}`]}`)}</p>}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => update({ units: [...form.units, newTypeUnitRow()] })}><Plus size={14} />{t('catalogSetup.typeWizard.units.add')}</Button>
        <Button variant="ghost" size="sm" onClick={() => setDialog({ initial: null, suggestion: null })}><Plus size={14} />{t('catalogSetup.typeWizard.units.createUnit')}</Button>
      </div>

      <UnitFormDialog
        open={Boolean(dialog)}
        unit={null}
        initial={dialog?.initial}
        onClose={() => setDialog(null)}
        onSaved={(id) => addCreatedUnit(id, dialog?.suggestion)}
      />
    </div>
  )
}
