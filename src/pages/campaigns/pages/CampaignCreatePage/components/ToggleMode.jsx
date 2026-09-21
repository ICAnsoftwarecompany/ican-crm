// Advantage-vs-Manual (or any two/N-way) mode control, as stacked
// full-width radio rows — follows the real `type="radio"` precedent in
// shared/components/data-table/ExportDialog.jsx. No segmented-pill toggle
// exists yet in this codebase, so this keeps the wizard consistent with
// that established idiom instead of inventing a new control style.
export function ToggleMode({ name, value, onChange, options }) {
  return (
    <div className="grid gap-2">
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
            value === option.value
              ? 'border-[#00C2CB] bg-[#E8F9FA]'
              : 'border-[var(--border)] bg-[var(--surface)] hover:border-[#00C2CB]/50'
          }`}
          onMouseEnter={option.onFocusGuide}
          onMouseLeave={option.onBlurGuide}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            onFocus={option.onFocusGuide}
            onBlur={option.onBlurGuide}
            className="mt-1"
          />
          <div>
            <p className="text-sm font-bold text-[var(--text)]">{option.title}</p>
            {option.description && <p className="mt-0.5 text-xs text-[var(--text-muted)]">{option.description}</p>}
          </div>
        </label>
      ))}
    </div>
  )
}
