export function AiSetupSection({ title, description, children }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <h2 className="text-sm font-bold text-[var(--text)]">{title}</h2>
      {description && <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

/** Accessible on/off switch (no shared Switch primitive exists yet). */
export function AiToggle({ checked, onChange, label, description, disabled = false }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-[var(--text)]">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-[var(--text-muted)]">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)] disabled:opacity-50',
          checked ? 'bg-[var(--brand-accent)]' : 'bg-[var(--border)]',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[1.375rem] rtl:-translate-x-[1.375rem]' : 'translate-x-0.5 rtl:-translate-x-0.5',
          ].join(' ')}
        />
      </button>
    </label>
  )
}
