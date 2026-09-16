export function TasksWorkspace({
  sidebar,
  header,
  children,
  footer,
  sidebarCollapsed = false,
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        {sidebar && (
          <div
            className={[
              'transition-all duration-200',
              sidebarCollapsed ? 'xl:w-[76px]' : 'xl:w-[280px]',
            ].join(' ')}
          >
            {sidebar}
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-4">
          {header}
          {children}
          {footer}
        </div>
      </div>
    </div>
  )
}
