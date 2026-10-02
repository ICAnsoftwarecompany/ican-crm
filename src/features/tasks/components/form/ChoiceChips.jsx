import { fieldLabelClass } from './taskFormStyles'

/**
 * A labelled row of single-choice chips (radio group). `renderLabel(option)` returns the chip
 * content; `renderIcon(option)` an optional icon component.
 */
export function ChoiceChips({ label, options, value, onChange, renderLabel, renderIcon }) {
  return (
    <div className={fieldLabelClass}>
      <span>{label}</span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = value === option
          const Icon = renderIcon?.(option)
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option)}
              className={[
                'inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-xs font-black transition-colors',
                active
                  ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]'
                  : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)]',
              ].join(' ')}
            >
              {Icon && <Icon size={13} />}
              {renderLabel(option)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
