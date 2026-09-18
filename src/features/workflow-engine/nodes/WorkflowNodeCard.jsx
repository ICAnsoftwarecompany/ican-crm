import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'

/**
 * Shared presentational shell for every node card. Not itself one of the
 * six core node types (see docs "Node Components") — the six
 * `Workflow*Node` components below all render through this.
 */
export function WorkflowNodeCard({ icon: Icon, accent = '#00C2CB', title, subtitle, backendSupport, selected, onClick, onRemove, children }) {
  const { t } = useTranslation()

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && onClick?.()}
      className={cn(
        'relative w-64 shrink-0 rounded-xl border bg-[var(--surface)] p-3 text-start shadow-sm transition-colors cursor-pointer',
        selected ? 'border-[#00C2CB] ring-2 ring-[#00C2CB]/30' : 'border-[var(--border)] hover:border-[#00C2CB]/50'
      )}
    >
      <div className="flex items-start gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${accent}1A`, color: accent }}>
          {Icon ? <Icon size={16} /> : null}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[var(--text)]">{title}</p>
          {subtitle && <p className="truncate text-xs text-[var(--text-muted)]">{subtitle}</p>}
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onRemove()
            }}
            className="shrink-0 rounded p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
            aria-label={t('actions.delete')}
          >
            <X size={14} />
          </button>
        )}
      </div>
      {backendSupport === false && (
        <p className="mt-2 rounded bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-800">
          {t('workflow.builder.backendNotConnected')}
        </p>
      )}
      {children}
    </div>
  )
}
