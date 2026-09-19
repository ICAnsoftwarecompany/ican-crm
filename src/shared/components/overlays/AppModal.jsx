import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useTranslation } from 'react-i18next'

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export function AppModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
  contentClassName,
  closeOnBackdrop = true,
}) {
  const { t } = useTranslation()
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const modalId = `modal-${title?.replace(/\s+/g, '-')}`
  const descriptionId = description ? `${modalId}-description` : undefined

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-2 sm:items-center sm:p-4"
      onClick={closeOnBackdrop ? onClose : undefined}
      role="presentation"
    >
      <div
        className={cn(
          'bg-[var(--surface)] rounded-lg shadow-xl w-full',
          'max-h-[calc(100vh-1rem)] overflow-y-auto sm:max-h-[90vh]',
          'dark:bg-[var(--surface)]',
          sizes[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalId}
        aria-describedby={descriptionId}
      >
        <div className="flex min-w-0 items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="min-w-0 flex-1">
            {title && (
              <h2 id={modalId} className="font-bold font-arabic text-lg text-[var(--text)]">
                {title}
              </h2>
            )}
            {description && (
              <p id={descriptionId} className="text-sm text-[var(--text-light)] font-arabic mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className={cn(
              'p-1 hover:bg-[var(--surface-2)] rounded-lg',
              'transition-colors focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-[#00C2CB] ms-2 flex-shrink-0'
            )}
            aria-label={t('actions.close')}
          >
            <X size={20} className="text-[var(--text)]" />
          </button>
        </div>

        <div className={cn('min-w-0 p-4', contentClassName)}>
          {children}
        </div>

        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] p-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
