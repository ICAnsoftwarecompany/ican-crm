import { useTranslation } from 'react-i18next'
import { Input } from '../../../../../shared/components/ui/Input'
import { Select } from '../../../../../shared/components/ui/Select'
import { cn } from '../../../../../shared/utils/cn'

export const TEXTAREA_CLASS =
  'min-h-[96px] w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-brand-accent'

function FieldLabel({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-[var(--text)]">
      {children}
    </label>
  )
}

function FieldError({ error }) {
  return error ? <p className="text-xs text-status-lost">{error}</p> : null
}

/** Tenant label in both languages: `{ ar, en }`. */
export function LocalizedTextField({ label, value, onChange, error, hint, multiline = false }) {
  const { t } = useTranslation()
  const current = value && typeof value === 'object' ? value : { ar: '', en: '' }
  const setLang = (lang) => (event) => onChange({ ...current, [lang]: event.target.value })
  return (
    <fieldset className="grid gap-1.5">
      <legend className="mb-1.5 text-sm font-medium text-[var(--text)]">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {['ar', 'en'].map((lang) =>
          multiline ? (
            <textarea
              key={lang}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              lang={lang}
              className={TEXTAREA_CLASS}
              value={current[lang] || ''}
              placeholder={t(`service.settings.fields.language.${lang}`)}
              aria-label={`${label} · ${t(`service.settings.fields.language.${lang}`)}`}
              onChange={setLang(lang)}
            />
          ) : (
            <Input
              key={lang}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              lang={lang}
              value={current[lang] || ''}
              placeholder={t(`service.settings.fields.language.${lang}`)}
              aria-label={`${label} · ${t(`service.settings.fields.language.${lang}`)}`}
              onChange={setLang(lang)}
            />
          )
        )}
      </div>
      {hint && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
      <FieldError error={error} />
    </fieldset>
  )
}

export function CheckboxGroupField({ label, value = [], options = [], onChange, hint }) {
  const selected = new Set((value || []).map(String))
  const toggle = (optionValue) => {
    const next = new Set(selected)
    if (next.has(String(optionValue))) next.delete(String(optionValue))
    else next.add(String(optionValue))
    onChange([...next])
  }
  return (
    <fieldset className="grid gap-1.5">
      <legend className="mb-1.5 text-sm font-medium text-[var(--text)]">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = selected.has(String(option.value))
          return (
            <label
              key={option.value}
              className={cn(
                'inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors',
                checked ? 'border-brand-accent bg-[var(--brand-accent-soft)] text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-muted)]'
              )}
            >
              <input type="checkbox" className="accent-[var(--brand-accent)]" checked={checked} onChange={() => toggle(option.value)} />
              {option.label}
            </label>
          )
        })}
      </div>
      {hint && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
    </fieldset>
  )
}

export function SwitchField({ label, value, onChange, hint }) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-[var(--border)] px-3 py-2">
      <input type="checkbox" className="mt-1 accent-[var(--brand-accent)]" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />
      <span className="grid gap-0.5">
        <span className="text-sm font-medium text-[var(--text)]">{label}</span>
        {hint && <span className="text-xs text-[var(--text-muted)]">{hint}</span>}
      </span>
    </label>
  )
}

/** Minutes stored, edited as hours + minutes. */
export function DurationField({ label, value, onChange, error }) {
  const { t } = useTranslation()
  const total = Number(value) || 0
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  const set = (nextHours, nextMinutes) => onChange(Math.max(0, Number(nextHours) || 0) * 60 + Math.max(0, Number(nextMinutes) || 0))
  return (
    <div className="grid gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      {/* dir wrapper keeps unit suffixes after the digits in RTL too */}
      <div className="grid grid-cols-2 gap-2 [&>div]:[direction:ltr]">
        <Input type="number" min="0" value={hours} aria-label={`${label} · ${t('service.settings.fields.hours')}`} endIcon={<span className="text-xs">{t('service.settings.fields.hoursShort')}</span>} onChange={(event) => set(event.target.value, minutes)} />
        <Input type="number" min="0" max="59" value={minutes} aria-label={`${label} · ${t('service.settings.fields.minutes')}`} endIcon={<span className="text-xs">{t('service.settings.fields.minutesShort')}</span>} onChange={(event) => set(hours, event.target.value)} />
      </div>
      <FieldError error={error} />
    </div>
  )
}

/**
 * Renders one field of a resource definition.
 * Field: { name, type: text|textarea|localized|localizedTextarea|select|checkboxes|switch|number|duration|custom,
 *          labelKey, hintKey?, options?(ctx), component? (custom) }
 */
export function ResourceField({ field, value, onChange, error, ctx }) {
  const { t } = useTranslation()
  const label = t(field.labelKey)
  const hint = field.hintKey ? t(field.hintKey, field.hintValues) : undefined
  const options = typeof field.options === 'function' ? field.options(ctx) : field.options || []

  switch (field.type) {
    case 'localized':
      return <LocalizedTextField label={label} value={value} onChange={onChange} error={error} hint={hint} />
    case 'localizedTextarea':
      return <LocalizedTextField label={label} value={value} onChange={onChange} error={error} hint={hint} multiline />
    case 'textarea':
      return (
        <label className="grid gap-1.5 text-sm font-medium text-[var(--text)]">
          {label}
          <textarea className={TEXTAREA_CLASS} value={value || ''} onChange={(event) => onChange(event.target.value)} />
          {hint && <span className="text-xs font-normal text-[var(--text-muted)]">{hint}</span>}
          <FieldError error={error} />
        </label>
      )
    case 'select':
      return <Select label={label} options={options} value={value ?? ''} onChange={(next) => onChange(next || null)} error={error} placeholder={field.placeholderKey ? t(field.placeholderKey) : undefined} />
    case 'checkboxes':
      return <CheckboxGroupField label={label} value={value} options={options} onChange={onChange} hint={hint} />
    case 'switch':
      return <SwitchField label={label} value={value} onChange={onChange} hint={hint} />
    case 'number':
      return <Input label={label} type="number" dir="ltr" value={value ?? ''} error={error} hint={hint} onChange={(event) => onChange(event.target.value === '' ? null : Number(event.target.value))} />
    case 'duration':
      return <DurationField label={label} value={value} onChange={onChange} error={error} />
    case 'custom': {
      const Component = field.component
      return <Component label={label} value={value} onChange={onChange} error={error} ctx={ctx} />
    }
    default:
      return <Input label={label} value={value ?? ''} dir={field.ltr ? 'ltr' : undefined} error={error} hint={hint} onChange={(event) => onChange(event.target.value)} />
  }
}
