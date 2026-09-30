import { useTranslation } from 'react-i18next'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * Title block + collapse toggle. `icon`/`description` are optional: omit both for the compact
 * one-line header (Social Media / Outreach style).
 */
export function SubSidebarHeader({
  icon: Icon,
  title,
  description,
  collapsed = false,
  onToggleCollapse,
  expandLabel,
  collapseLabel,
  actions,
}) {
  const { t } = useTranslation()
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose
  const toggleLabel = collapsed
    ? expandLabel || t('common.subSidebar.expand')
    : collapseLabel || t('common.subSidebar.collapse')

  return (
    <div className={cn('border-b border-[var(--border)] p-3', collapsed && 'px-2')}>
      <div className={cn('flex items-center gap-3', collapsed && 'flex-col justify-center gap-2')}>
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
            <Icon size={18} />
          </div>
        )}

        {!collapsed && (
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-bold text-[var(--text)]">{title}</h2>
            {description && <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{description}</p>}
          </div>
        )}

        {!collapsed && actions}

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
              'text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]'
            )}
            aria-label={toggleLabel}
            title={toggleLabel}
          >
            <ToggleIcon size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
