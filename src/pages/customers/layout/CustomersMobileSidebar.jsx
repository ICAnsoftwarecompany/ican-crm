import { X } from 'lucide-react'
import { CustomersSidebar } from './CustomersSidebar'
import { cn } from '../../../shared/utils/cn'

export function CustomersMobileSidebar({ open, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="إغلاق قائمة العملاء"
      />
      <div
        id="customers-mobile-sidebar"
        className={cn(
          'absolute inset-y-0 start-0 w-[min(86vw,280px)] bg-[var(--surface)] shadow-xl',
          'border-e border-[var(--border)]'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="قائمة العملاء"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute end-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]"
          aria-label="إغلاق قائمة العملاء"
        >
          <X size={18} />
        </button>
        <CustomersSidebar onNavigate={onClose} className="flex h-full max-h-none w-full border-e-0 lg:flex" />
      </div>
    </div>
  )
}
