import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { cn } from '../../../../shared/utils/cn'
import { CAPABILITY_GROUPS, capabilitiesForKind, getCapabilityDefinition } from '../../constants/capabilityRegistry'
import { CapabilityConfigFields } from '../../components/common/CapabilityConfigFields'
import { TextAreaField, useCapabilityName } from '../../components/common/catalogUi'
import { HelpField } from '../../components/common/HelpTip'

function CapabilityCard({ definition, active, config, onToggle, onConfig }) {
  const { t } = useTranslation()
  const capabilityName = useCapabilityName()
  const inputId = `capability-${definition.code}`
  return (
    <HelpField title={capabilityName(definition.code)} text={t(`catalog.capabilities.${definition.code}.description`)}>
      <div className={cn('rounded-lg border p-3 transition-colors', active ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]' : 'border-[var(--border)] bg-[var(--surface)]')}>
        <label htmlFor={inputId} className="flex cursor-pointer items-start gap-3 pe-6">
          <input id={inputId} type="checkbox" className="mt-1 h-4 w-4 accent-[var(--brand-accent)]" checked={active} onChange={(event) => onToggle(event.target.checked)} />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-[var(--text)]">{capabilityName(definition.code)}</span>
            <span className="block text-xs text-[var(--text-muted)]">{t(`catalog.capabilities.${definition.code}.description`)}</span>
          </span>
        </label>
        {active && definition.fields.length > 0 && (
          <div className="mt-3 border-t border-[var(--border)] pt-3">
            <CapabilityConfigFields code={definition.code} value={config} onChange={onConfig} />
          </div>
        )}
      </div>
    </HelpField>
  )
}

/** Codes outside the registry, added by code with a JSON config (for capabilities the UI does not know yet). */
function CustomCapabilities({ wizard }) {
  const { t } = useTranslation()
  const { form, toggle, setCapabilityConfig, errors } = wizard
  const [open, setOpen] = useState(form.capabilities.some((capability) => !getCapabilityDefinition(capability.code)))
  const [code, setCode] = useState('')
  const custom = form.capabilities.map((capability, index) => ({ capability, index })).filter(({ capability }) => !getCapabilityDefinition(capability.code))
  const add = () => {
    if (!code || form.capabilities.some((capability) => capability.code === code)) return
    toggle(code, true)
    setCode('')
  }

  return (
    <section className="rounded-lg border border-dashed border-[var(--border)] p-3">
      <button type="button" className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {t('catalogSetup.typeWizard.capabilities.advanced')}
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-[var(--text-muted)]">{t('catalog.capabilities.customHint')}</p>
          {custom.map(({ capability, index }) => (
            <div key={capability.code} className="space-y-2 rounded-lg border border-[var(--border)] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm" dir="ltr">{capability.code}</span>
                <Button variant="ghost" size="icon" onClick={() => toggle(capability.code, false)} aria-label={t('catalog.common.remove')}><Trash2 size={16} /></Button>
              </div>
              <TextAreaField
                label={t('catalog.capabilities.configJson')}
                value={capability.configJson}
                dir="ltr"
                rows={3}
                error={errors[`capabilities.${index}`] ? t(`catalog.validation.${errors[`capabilities.${index}`]}`) : undefined}
                onChange={(configJson) => setCapabilityConfig(capability.code, { configJson })}
              />
            </div>
          ))}
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <Input
              label={t('catalog.capabilities.customCode')}
              value={code}
              dir="ltr"
              placeholder="pricing_rules"
              onChange={(event) => setCode(event.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase())}
            />
            <Button className="self-end" variant="outline" disabled={!code} onClick={add}><Plus size={14} />{t('actions.add')}</Button>
          </div>
        </div>
      )}
    </section>
  )
}

/** Step 3: what products of this type track or need, grouped (tracking, after-sales, billing, delivery). */
export function CapabilitiesStep({ wizard }) {
  const { t } = useTranslation()
  const capabilityName = useCapabilityName()
  const { form, toggle, setCapabilityConfig, errors } = wizard
  const offered = capabilitiesForKind(form.kind)
  const byCode = new Map(form.capabilities.map((capability) => [capability.code, capability]))

  return (
    <div className="space-y-5">
      {Array.isArray(errors.conflicts) && errors.conflicts.length > 0 && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-[#F59E0B] bg-[var(--surface-2)] p-3 text-sm text-[var(--text)]">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[#F59E0B]" aria-hidden="true" />
          <ul className="space-y-1">
            {errors.conflicts.map(([a, b]) => (
              <li key={`${a}-${b}`}>{t('catalogSetup.typeWizard.capabilities.conflict', { a: capabilityName(a), b: capabilityName(b) })}</li>
            ))}
          </ul>
        </div>
      )}

      {CAPABILITY_GROUPS.map((group) => {
        const items = offered.filter((definition) => definition.group === group)
        if (!items.length) return null
        return (
          <section key={group} aria-labelledby={`capability-group-${group}`}>
            <h3 id={`capability-group-${group}`} className="text-sm font-semibold text-[var(--text)]">{t(`catalogSetup.capabilityGroups.${group}.title`)}</h3>
            <p className="mb-2 text-xs text-[var(--text-muted)]">{t(`catalogSetup.capabilityGroups.${group}.hint`)}</p>
            <div className="grid gap-2 md:grid-cols-2">
              {items.map((definition) => (
                <CapabilityCard
                  key={definition.code}
                  definition={definition}
                  active={byCode.has(definition.code)}
                  config={byCode.get(definition.code)?.config || {}}
                  onToggle={(on) => toggle(definition.code, on)}
                  onConfig={(config) => setCapabilityConfig(definition.code, { config })}
                />
              ))}
            </div>
          </section>
        )
      })}

      <CustomCapabilities wizard={wizard} />
    </div>
  )
}
