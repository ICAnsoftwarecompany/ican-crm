import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../../../shared/utils/cn'
import { useWizardField } from '../../context/MetaWizardContext'
import { FieldFrame, inputClassName } from './FieldFrame'

// Controlled inputs bound to a wizard path: they report focus to the guide
// panel, mark themselves touched on blur and render their own issue.

export function TextField({ path, guideKey, label, hint, value, onChange, required, optional, type = 'text', placeholder, dir, className, maxLength, action, disabled, inputMode, startAdornment }) {
  const id = useId()
  const { issue, hasError, fieldProps } = useWizardField(path, guideKey)
  return (
    <FieldFrame label={label} htmlFor={id} hint={hint} issue={issue} required={required} optional={optional} className={className} action={action} fieldProps={fieldProps}>
      <div className="relative flex items-center">
        {startAdornment && <span className="pointer-events-none absolute start-3 text-xs font-semibold text-[var(--text-muted)]">{startAdornment}</span>}
        <input
          id={id}
          type={type}
          value={value ?? ''}
          dir={dir}
          inputMode={inputMode}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          onChange={(event) => onChange(event.target.value)}
          onFocus={fieldProps.onFocus}
          onBlur={fieldProps.onBlur}
          className={cn(inputClassName(hasError), startAdornment && 'ps-12')}
        />
      </div>
    </FieldFrame>
  )
}

export function TextAreaField({ path, guideKey, label, hint, value, onChange, required, optional, placeholder, rows = 3, recommendedLength, className, action }) {
  const id = useId()
  const { t } = useTranslation()
  const { issue, hasError, fieldProps } = useWizardField(path, guideKey)
  const length = String(value || '').length
  const over = recommendedLength && length > recommendedLength
  return (
    <FieldFrame label={label} htmlFor={id} hint={hint} issue={issue} required={required} optional={optional} className={className} action={action} fieldProps={fieldProps}>
      <textarea
        id={id}
        rows={rows}
        value={value ?? ''}
        placeholder={placeholder}
        aria-invalid={hasError || undefined}
        onChange={(event) => onChange(event.target.value)}
        onFocus={fieldProps.onFocus}
        onBlur={fieldProps.onBlur}
        className={cn(inputClassName(hasError), 'h-auto min-h-[76px] resize-y py-2 leading-6')}
      />
      {recommendedLength ? (
        <span className={cn('self-end text-[11px]', over ? 'text-[var(--notification-warning)]' : 'text-[var(--text-light)]')} dir="ltr">
          {t('campaignWizard.common.characters', { count: length, max: recommendedLength })}
        </span>
      ) : null}
    </FieldFrame>
  )
}

export function SelectField({ path, guideKey, label, hint, value, onChange, options, placeholder, required, optional, className, disabled, action }) {
  const id = useId()
  const { t } = useTranslation()
  const { issue, hasError, fieldProps } = useWizardField(path, guideKey)
  return (
    <FieldFrame label={label} htmlFor={id} hint={hint} issue={issue} required={required} optional={optional} className={className} action={action} fieldProps={fieldProps}>
      <div className="relative">
        <select
          id={id}
          value={value ?? ''}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          onChange={(event) => onChange(event.target.value)}
          onFocus={fieldProps.onFocus}
          onBlur={fieldProps.onBlur}
          className={cn(inputClassName(hasError), 'cursor-pointer appearance-none pe-9')}
        >
          {placeholder !== false && <option value="">{placeholder || t('campaignWizard.common.choose')}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[var(--text-light)]" />
      </div>
    </FieldFrame>
  )
}

export function DateTimeField({ path, guideKey, label, hint, value, onChange, required, min, className, timezoneLabel }) {
  const id = useId()
  const { issue, hasError, fieldProps } = useWizardField(path, guideKey)
  return (
    <FieldFrame label={label} htmlFor={id} hint={hint} issue={issue} required={required} className={className} fieldProps={fieldProps}
      action={timezoneLabel ? <span className="text-[11px] text-[var(--text-light)]" dir="ltr">{timezoneLabel}</span> : null}>
      <input
        id={id}
        type="datetime-local"
        value={value ?? ''}
        min={min}
        dir="ltr"
        aria-invalid={hasError || undefined}
        onChange={(event) => onChange(event.target.value)}
        onFocus={fieldProps.onFocus}
        onBlur={fieldProps.onBlur}
        className={inputClassName(hasError)}
      />
    </FieldFrame>
  )
}
