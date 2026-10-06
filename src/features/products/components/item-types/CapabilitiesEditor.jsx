import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { capabilitiesForKind, getCapabilityDefinition } from '../../constants/capabilityRegistry'
import { CapabilityConfigFields } from '../common/CapabilityConfigFields'
import { TextAreaField, useCapabilityName } from '../common/catalogUi'

/**
 * Capabilities of an item type: add from the registry (filtered by kind) or by code, and edit each config.
 * Codes outside the registry keep their config as JSON. `value` = form.capabilities.
 */
export function CapabilitiesEditor({ kind, value = [], errors = {}, onChange }) {
  const { t } = useTranslation()
  const capabilityName = useCapabilityName()
  const [picked, setPicked] = useState('')
  const [customCode, setCustomCode] = useState('')
  const used = new Set(value.map((capability) => capability.code))
  const available = capabilitiesForKind(kind).filter((capability) => !used.has(capability.code))

  const add = (code) => {
    const clean = code.trim()
    if (!clean || used.has(clean)) return
    onChange([...value, { code: clean, version: 1, config: {}, configJson: getCapabilityDefinition(clean) ? '' : '{}' }])
    setPicked('')
    setCustomCode('')
  }
  const update = (code, patch) => onChange(value.map((capability) => (capability.code === code ? { ...capability, ...patch } : capability)))
  const remove = (code) => onChange(value.filter((capability) => capability.code !== code))

  return (
    <div className="space-y-4">
      {!value.length && <p className="text-sm text-[var(--text-muted)]">{t('catalog.itemTypes.noCapabilities')}</p>}

      {value.map((capability, index) => {
        const known = Boolean(getCapabilityDefinition(capability.code))
        return (
          <section key={capability.code} className="space-y-3 rounded-lg border border-[var(--border)] p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-[var(--text)]">{capabilityName(capability.code)}</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {known ? t(`catalog.capabilities.${capability.code}.description`) : t('catalog.capabilities.customHint')}
                  <span className="ms-1 font-mono" dir="ltr">{capability.code}@v{capability.version || 1}</span>
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(capability.code)} aria-label={t('catalog.common.remove')}><Trash2 size={16} /></Button>
            </div>
            {known ? (
              <CapabilityConfigFields code={capability.code} value={capability.config} onChange={(config) => update(capability.code, { config })} />
            ) : (
              <TextAreaField
                label={t('catalog.capabilities.configJson')}
                value={capability.configJson}
                dir="ltr"
                rows={4}
                error={errors[`capabilities.${index}`] ? t(`catalog.validation.${errors[`capabilities.${index}`]}`) : undefined}
                onChange={(configJson) => update(capability.code, { configJson })}
              />
            )}
          </section>
        )
      })}

      <div className="grid gap-3 rounded-lg border border-dashed border-[var(--border)] p-3 sm:grid-cols-[1fr_auto]">
        <Select
          label={t('catalog.capabilities.add')}
          value={picked}
          options={available.map((capability) => ({ value: capability.code, label: capabilityName(capability.code) }))}
          onChange={setPicked}
        />
        <Button className="self-end" variant="outline" disabled={!picked} onClick={() => add(picked)}><Plus size={14} />{t('actions.add')}</Button>
        <Input
          label={t('catalog.capabilities.customCode')}
          value={customCode}
          dir="ltr"
          placeholder="pricing_rules"
          onChange={(event) => setCustomCode(event.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase())}
        />
        <Button className="self-end" variant="outline" disabled={!customCode} onClick={() => add(customCode)}><Plus size={14} />{t('actions.add')}</Button>
      </div>
    </div>
  )
}
