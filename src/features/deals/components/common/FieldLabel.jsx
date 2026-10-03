/** Label + control + optional error, same look as the rest of the deal forms. */
export function FieldLabel({ label, error, hint, children, className = '' }) {
  return (
    <label className={`block space-y-1 text-sm text-[var(--text)] ${className}`}>
      <span className="font-medium">{label}</span>
      {children}
      {hint && !error && <span className="block text-xs text-[var(--text-muted)]">{hint}</span>}
      {error && <span className="block text-xs text-red-600 dark:text-red-400">{error}</span>}
    </label>
  )
}

export const dealInputClass = 'h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--brand-accent)] focus:ring-2 focus:ring-[var(--brand-accent-soft)] disabled:opacity-60'
