import { useTranslation } from 'react-i18next'
import { toggleCapability } from './aiSetupModel'

/**
 * Checklist of what AI may do in this module. `capabilities` come from the module
 * ({ id, label, description } — already translated).
 */
export function AiCapabilityList({ capabilities = [], value = [], onChange, disabled = false }) {
  const { t } = useTranslation()

  if (!capabilities.length) {
    return <p className="text-sm text-[var(--text-muted)]">{t('aiSetup.capabilities.none')}</p>
  }

  return (
    <div className="grid gap-2 md:grid-cols-2">
      {capabilities.map((capability) => {
        const checked = value.includes(capability.id)
        return (
          <label
            key={capability.id}
            className={[
              'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
              checked ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]' : 'border-[var(--border)] hover:bg-[var(--surface-2)]',
              disabled ? 'cursor-not-allowed opacity-60' : '',
            ].join(' ')}
          >
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-[var(--brand-accent)]"
              checked={checked}
              disabled={disabled}
              onChange={() => onChange(toggleCapability(value, capability.id))}
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-[var(--text)]">{capability.label}</span>
              {capability.description && (
                <span className="mt-0.5 block text-xs leading-5 text-[var(--text-muted)]">{capability.description}</span>
              )}
            </span>
          </label>
        )
      })}
    </div>
  )
}
