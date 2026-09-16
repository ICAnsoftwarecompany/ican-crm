import { CustomersPageActions } from './page-actions'

export function CustomersPageHeader({
  title,
  description,
  onAdd,
  onImport,
  onExport,
  onTrash,
  trashActive = false,
  onTableSettings,
}) {
  return (
    <header className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-base font-bold leading-6 text-[var(--text)]">{title}</h1>
          {description && (
            <p className="max-w-3xl truncate text-xs leading-5 text-[var(--text-muted)]">{description}</p>
          )}
        </div>

        <CustomersPageActions
          onAdd={onAdd}
          onImport={onImport}
          onExport={onExport}
          onTrash={onTrash}
          trashActive={trashActive}
          onTableSettings={onTableSettings}
        />
      </div>
    </header>
  )
}
