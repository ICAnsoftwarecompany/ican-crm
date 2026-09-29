import { cn } from '../../utils/cn'

export function WorkspaceSubSidebarFrame({ children, className, framed = true }) {
  return (
    <aside
      className={cn(
        'flex h-full min-h-0 flex-col overflow-hidden bg-[var(--surface)]',
        framed && 'rounded-md border border-[var(--border)] shadow-sm',
        className
      )}
    >
      {children}
    </aside>
  )
}
