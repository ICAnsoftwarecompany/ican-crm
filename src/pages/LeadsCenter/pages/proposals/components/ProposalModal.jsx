import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/Button'
import { cn } from '../../../../../shared/utils/cn'

export function ProposalModal({ open, title, children, onClose, className, footer }) {
  const { t } = useTranslation()
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[120000] flex items-center justify-center bg-[#0B1220]/55 p-4">
      <div className={cn('max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl', className)}>
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-base font-black text-[var(--text)]">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('customers.table.activityTimeline.close')}>
            <X size={18} />
          </Button>
        </div>
        <div className="max-h-[calc(92vh-9rem)] overflow-y-auto p-5">{children}</div>
        {footer ? <div className="border-t border-[var(--border)] px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  )
}
