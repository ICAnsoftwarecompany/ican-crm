import { Check } from 'lucide-react'
import { cn } from '../../../../../shared/utils/cn'

/** Big selectable card (objectives, presets, budget strategy …). */
export function ChoiceCard({ icon: Icon, title, description, selected, onSelect, badge, footer, disabled, onFocus, className, compact }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      onFocus={onFocus}
      onMouseEnter={onFocus}
      className={cn(
        'group relative flex h-full w-full flex-col items-start gap-2 rounded-lg border text-start transition-all',
        compact ? 'p-3' : 'p-4',
        selected
          ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] shadow-sm'
          : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand-accent)] hover:bg-[var(--surface-2)]',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <div className="flex w-full items-start gap-3">
        {Icon && (
          <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', selected ? 'bg-[var(--brand-accent)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-muted)]')}>
            <Icon size={18} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-[var(--text)]">{title}</span>
            {badge}
          </div>
          {description && <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{description}</p>}
        </div>
        <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border', selected ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)] text-white' : 'border-[var(--border)]')}>
          {selected && <Check size={12} />}
        </span>
      </div>
      {footer && <div className="w-full">{footer}</div>}
    </button>
  )
}

/** Compact segmented control for 2–4 exclusive options. */
export function SegmentedControl({ value, onChange, options, ariaLabel, size = 'md', onFocus }) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="inline-flex max-w-full flex-wrap gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          disabled={option.disabled}
          onClick={() => onChange(option.value)}
          onFocus={onFocus}
          className={cn(
            'rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
            value === option.value ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function Switch({ checked, onChange, label, description, disabled, onFocus }) {
  return (
    <label className={cn('flex cursor-pointer items-start justify-between gap-3', disabled && 'cursor-not-allowed opacity-60')}>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-[var(--text)]">{label}</span>
        {description && <span className="mt-0.5 block text-xs leading-5 text-[var(--text-muted)]">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onFocus={onFocus}
        onClick={() => onChange(!checked)}
        className={cn('relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors', checked ? 'bg-[var(--brand-accent)]' : 'bg-[var(--border)]')}
      >
        <span className={cn('inline-block h-4 w-4 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-4 rtl:-translate-x-4' : 'translate-x-0.5 rtl:-translate-x-0.5')} />
      </button>
    </label>
  )
}

/** Multi-select chip (placements, days, question types). */
export function ToggleChip({ selected, onToggle, children, disabled, title }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      title={title}
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        selected ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
      )}
    >
      {selected && <Check size={12} />}
      {children}
    </button>
  )
}
