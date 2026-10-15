import { CustomersPageActions } from './page-actions'
import './CustomersPageHeader.css'

export function CustomersPageHeader({
  title,
  description,
  onAdd,
  onImport,
  onExport,
  onTrash,
  trashActive = false,
  onTableSettings,
  viewToggle = null,
}) {
  return (
    <header className="customers-page-header rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
      <div className="customers-page-header-layout">
        <div className="customers-page-header-title min-w-0">
          <h1 className="text-base font-bold leading-6 text-[var(--text)]">{title}</h1>
          {description && (
            <p className="max-w-3xl truncate text-xs leading-5 text-[var(--text-muted)]">{description}</p>
          )}
        </div>

        <div className="customers-page-header-controls">
          {viewToggle && <div className="customers-page-header-views">{viewToggle}</div>}
          <CustomersPageActions
            onAdd={onAdd}
            onImport={onImport}
            onExport={onExport}
            onTrash={onTrash}
            trashActive={trashActive}
            onTableSettings={onTableSettings}
          />
        </div>
      </div>
    </header>
  )
}
