import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

/** Slide-in drawer that hosts a sub-sidebar below the `lg` breakpoint. */
export function SubSidebarMobileDrawer({ open, onClose, id, label, children }) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) return undefined
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  const closeLabel = t('common.subSidebar.closeMenu')

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
      <button type="button" className="absolute inset-0 bg-black/50" onClick={onClose} aria-label={closeLabel} />
      <div
        id={id}
        className={cn(
          'absolute inset-y-0 start-0 w-[min(86vw,280px)] bg-[var(--surface)] shadow-xl',
          'border-e border-[var(--border)]'
        )}
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute end-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]"
          aria-label={closeLabel}
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  )
}
