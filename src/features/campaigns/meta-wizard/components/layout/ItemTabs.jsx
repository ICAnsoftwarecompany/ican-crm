import { useTranslation } from 'react-i18next'
import { Copy, Plus, Trash2 } from 'lucide-react'
import { cn } from '../../../../../shared/utils/cn'
import { StatusDot } from '../fields'

/** Horizontal tabs for ad sets / ads with add, duplicate and remove. */
export function ItemTabs({ items, activeId, onSelect, onAdd, onDuplicate, onRemove, addLabel, ariaLabel, maxItems = 50 }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div role="tablist" aria-label={ariaLabel} className="flex max-w-full flex-wrap gap-1.5">
        {items.map((item) => {
          const active = item.id === activeId
          return (
            <div key={item.id} className={cn('group flex items-center rounded-lg border transition-colors', active ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]' : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]')}>
              <button type="button" role="tab" aria-selected={active} onClick={() => onSelect(item.id)} className="flex max-w-[220px] items-center gap-2 px-3 py-1.5 text-sm font-semibold text-[var(--text)]">
                <StatusDot status={item.status} />
                <span className="truncate">{item.label}</span>
              </button>
              {active && (
                <span className="flex items-center pe-1">
                  <button type="button" onClick={() => onDuplicate(item.id)} className="rounded-md p-1 text-[var(--text-muted)] hover:bg-[var(--surface)]" title={t('campaignWizard.common.duplicate')} aria-label={t('campaignWizard.common.duplicate')}><Copy size={13} /></button>
                  {items.length > 1 && (
                    <button type="button" onClick={() => onRemove(item.id)} className="rounded-md p-1 text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--notification-danger)]" title={t('campaignWizard.common.remove')} aria-label={t('campaignWizard.common.remove')}><Trash2 size={13} /></button>
                  )}
                </span>
              )}
            </div>
          )
        })}
      </div>
      {items.length < maxItems && (
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[var(--border)] px-3 py-1.5 text-sm font-semibold text-[var(--brand-accent)] hover:bg-[var(--surface-2)]">
          <Plus size={14} />
          {addLabel}
        </button>
      )}
    </div>
  )
}
