import { AppModal } from './AppModal'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'

const typeStyles = {
  info: 'bg-blue-50 border border-blue-200 text-blue-700',
  warning: 'bg-amber-50 border border-amber-200 text-amber-700',
  danger: 'bg-red-50 border border-red-200 text-red-700',
}

const typeIcons = {
  info: '✓',
  warning: '⚠',
  danger: '✕',
}

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  type = 'info',
  loading = false,
}) {
  const confirmVariant = type === 'danger' ? 'danger' : 'primary'

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {message && (
          <div className={cn(
            'p-3 rounded-lg font-arabic text-sm',
            typeStyles[type]
          )}>
            <div className="flex gap-2">
              <span className="text-lg flex-shrink-0">{typeIcons[type]}</span>
              <p>{message}</p>
            </div>
          </div>
        )}
      </div>
    </AppModal>
  )
}
