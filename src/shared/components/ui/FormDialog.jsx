import { AppModal } from '../overlays/AppModal'
import { Button } from './Button'
import { Spinner } from './Spinner'
import { cn } from '../../utils/cn'
import { useTranslation } from 'react-i18next'

export function FormDialog({
  open,
  onClose,
  title,
  description,
  children,
  onSubmit,
  submitText,
  cancelText,
  loading = false,
  submitDisabled = false,
  size = 'md',
  showCancel = true,
  showCloseButton = true,
  className,
  contentClassName,
}) {
  const { t } = useTranslation()
  const handleSubmit = (e) => {
    e.preventDefault()
    if (loading || submitDisabled) return
    onSubmit?.(e)
  }

  return (
    <AppModal
      isOpen={open}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      className={className}
      footer={
        <div className="flex gap-2 justify-end">
          {showCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText ?? t('actions.cancel')}
            </Button>
          )}
          <Button
            type="submit"
            form="form-dialog"
            loading={loading}
            disabled={submitDisabled || loading}
          >
            {submitText ?? t('actions.save')}
          </Button>
        </div>
      }
    >
      <form
        id="form-dialog"
        onSubmit={handleSubmit}
        className={cn('space-y-4', contentClassName)}
      >
        {children}
      </form>
    </AppModal>
  )
}
