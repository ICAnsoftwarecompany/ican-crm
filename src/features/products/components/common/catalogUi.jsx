import { useCallback, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '../../../../shared/components/ui/Badge'
import { getCapabilityDefinition } from '../../constants/capabilityRegistry'

/** Small building blocks shared by the catalog screens (2026-10-06). */

export const catalogInputClass = 'w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-light)] focus:outline-none focus:ring-2 focus:ring-[#00C2CB] disabled:opacity-60'

/** Label of an enum value: `catalog.options.<group>.<value>`, falling back to the backend value. */
export function useOptionLabel() {
  const { t } = useTranslation()
  return useCallback((group, value) => (value === undefined || value === null || value === ''
    ? ''
    : t(`catalog.options.${group}.${value}`, { defaultValue: String(value) })), [t])
}

/** `[{ value, label }]` for a Select, from a list of backend values. */
export function useOptions(group, values) {
  const label = useOptionLabel()
  return values.map((value) => ({ value: String(value), label: label(group, value) }))
}

export function useCapabilityName() {
  const { t } = useTranslation()
  return useCallback((code) => (getCapabilityDefinition(code)
    ? t(`catalog.capabilities.${code}.name`)
    : code), [t])
}

export function CheckboxField({ label, hint, checked, onChange, disabled }) {
  return (
    <label className="flex items-start gap-2 text-sm text-[var(--text)]">
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 accent-[#00C2CB]"
        checked={Boolean(checked)}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="min-w-0">
        <span className="font-medium">{label}</span>
        {hint && <span className="block text-xs text-[var(--text-muted)]">{hint}</span>}
      </span>
    </label>
  )
}

export function TextAreaField({ label, value, onChange, rows = 3, placeholder, dir, error, hint }) {
  const id = useId()
  const messageId = error || hint ? `${id}-message` : undefined
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[var(--text)]">{label}</label>
      <textarea
        id={id}
        className={catalogInputClass}
        rows={rows}
        dir={dir}
        value={value}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={messageId}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <p id={messageId} className="text-xs text-[#EF4444]">{error}</p>}
      {hint && !error && <p id={messageId} className="text-xs text-[var(--text-muted)]">{hint}</p>}
    </div>
  )
}

export function FormError({ message }) {
  if (!message) return null
  return <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">{message}</div>
}

const KIND_VARIANTS = { product: 'info', service: 'purple', plan: 'success', bundle: 'warning' }

export function KindBadge({ kind }) {
  const label = useOptionLabel()
  return <Badge variant={KIND_VARIANTS[kind] || 'default'}>{label('kinds', kind)}</Badge>
}

export function ActiveBadge({ active }) {
  const { t } = useTranslation()
  return <Badge variant={active ? 'success' : 'warning'}>{active ? t('catalog.common.active') : t('catalog.common.inactive')}</Badge>
}

const AVAILABILITY_VARIANTS = { available: 'success', reserved: 'warning', sold: 'info' }

export function AvailabilityBadge({ status, voided }) {
  const { t } = useTranslation()
  const label = useOptionLabel()
  if (voided) return <Badge variant="danger">{t('catalog.instances.voided')}</Badge>
  if (!status) return <span className="text-[var(--text-muted)]">—</span>
  return <Badge variant={AVAILABILITY_VARIANTS[status] || 'default'}>{label('availability', status)}</Badge>
}

export function CapabilityChips({ capabilities = [], emptyText }) {
  const name = useCapabilityName()
  if (!capabilities.length) return emptyText ? <span className="text-xs text-[var(--text-muted)]">{emptyText}</span> : null
  return (
    <div className="flex flex-wrap gap-1">
      {capabilities.map((capability) => (
        <Badge key={capability.code} variant="default">{name(capability.code)}</Badge>
      ))}
    </div>
  )
}

/** Numbers as "15,000" in the active language (prices, stock); `—` when empty. */
export function useNumberFormat() {
  const { i18n } = useTranslation()
  return useCallback((value) => {
    if (value === null || value === undefined || value === '') return '—'
    const number = Number(value)
    return Number.isFinite(number) ? number.toLocaleString(i18n.language, { maximumFractionDigits: 4 }) : String(value)
  }, [i18n.language])
}
