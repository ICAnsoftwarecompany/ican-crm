import { AppModal } from './AppModal'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'
import { useTranslation } from 'react-i18next'

const typeStyles = {
  info: 'bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200',
  warning: 'bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200',
  danger: 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-200',
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
  confirmText,
  cancelText,
  type = 'info',
  loading = false,
}) {
  const { t } = useTranslation()
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
            {cancelText ?? t('actions.cancel')}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText ?? t('actions.confirm')}
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
