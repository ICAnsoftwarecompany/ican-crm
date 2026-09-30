/** Title + description of a settings section, with an action on the end side and optional extra lines. */
export function PanelHeader({ resource, action, children }) {
  return (
    <header className="grid gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-1">
          <h2 className="text-lg font-bold text-[var(--text)]">{resource?.title}</h2>
          <p className="text-sm text-[var(--text-muted)]">{resource?.description}</p>
        </div>
        {action && <div className="shrink-0 whitespace-nowrap">{action}</div>}
      </div>
      {children}
    </header>
  )
}
