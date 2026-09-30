/**
 * Title row used by every module sub-page (create, reports, calendar, automation, customization,
 * AI setup, settings) so they all look the same inside a sub-sidebar layout.
 */
export function ModulePageHeader({ icon: Icon, title, description, actions }) {
  return (
    <header className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 gap-3">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
            <Icon size={19} />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-[var(--text)]">{title}</h1>
          {description && <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}
