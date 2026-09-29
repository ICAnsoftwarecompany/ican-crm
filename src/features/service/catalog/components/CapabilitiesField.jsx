import { useTranslation } from 'react-i18next'
import { Lock } from 'lucide-react'
import { Select } from '../../../../shared/components/ui/Select'
import { cn } from '../../../../shared/utils/cn'
import { useCapabilityRegistry, useServiceModels } from '../api/catalogApi'
import { applyPreset, capabilitiesForKind, requiredByOthers, toggleCapability } from '../utils/capabilities'
import { CapabilityConfigFields } from './CapabilityConfigFields'

const GROUPS = ['product', 'service', 'shared']

/**
 * Item type capabilities editor (custom settings field). The service model
 * preset only pre-selects capabilities; the backend works with capabilities.
 */
export function CapabilitiesField({ label, value = [], onChange, error, values, onPatch }) {
  const { t } = useTranslation()
  const registry = useCapabilityRegistry()
  const models = useServiceModels()
  const all = registry.data || []
  const available = capabilitiesForKind(all, values?.kind)
  const selected = value || []
  const locked = requiredByOthers(selected, all)

  const pickPreset = (key) => {
    const preset = (models.data || []).find((model) => model.key === key)
    onPatch({ service_model_preset: key || null, capabilities: preset ? applyPreset(selected, all, preset) : selected })
  }

  return (
    <fieldset className="grid gap-3">
      <legend className="mb-1.5 text-sm font-medium text-[var(--text)]">{label}</legend>
      <Select
        label={t('service.catalog.preset')}
        placeholder={t('service.catalog.noPreset')}
        value={values?.service_model_preset || ''}
        onChange={pickPreset}
        options={(models.data || []).map((model) => ({ value: model.key, label: `${model.key} · ${t(`service.models.${model.key}.name`)}` }))}
      />
      <p className="-mt-1 text-xs text-[var(--text-muted)]">{t('service.catalog.presetHint')}</p>

      {GROUPS.map((group) => {
        const entries = available.filter((entry) => entry.group === group)
        if (!entries.length) return null
        return (
          <div key={group} className="grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t(`service.catalog.groups.${group}`)}</p>
            {entries.map((entry) => {
              const current = selected.find((item) => item.code === entry.code)
              const isLocked = Boolean(current) && locked.has(entry.code)
              return (
                <div key={entry.code} className={cn('rounded-lg border p-3', current ? 'border-brand-accent' : 'border-[var(--border)]')}>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 accent-[var(--brand-accent)]"
                      checked={Boolean(current)}
                      disabled={isLocked}
                      onChange={(event) => onChange(toggleCapability(selected, all, entry.code, event.target.checked))}
                    />
                    <span className="grid flex-1 gap-0.5">
                      <span className="flex items-center gap-2 text-sm font-medium text-[var(--text)]">
                        {t(`service.capabilities.${entry.code}.name`)}
                        <code dir="ltr" className="text-[10px] text-[var(--text-muted)]">{entry.code}@v{entry.version}</code>
                        {isLocked && <Lock size={12} aria-label={t('service.catalog.requiredByOther')} className="text-[var(--text-muted)]" />}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">{t(`service.capabilities.${entry.code}.description`)}</span>
                    </span>
                  </label>
                  {current && entry.config_fields?.length > 0 && (
                    <div className="mt-3 border-t border-[var(--border)] pt-3">
                      <CapabilityConfigFields
                        entry={entry}
                        config={current.config}
                        onChange={(config) => onChange(selected.map((item) => (item.code === entry.code ? { ...item, config } : item)))}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
      {error && <p className="text-xs text-status-lost">{error}</p>}
    </fieldset>
  )
}
