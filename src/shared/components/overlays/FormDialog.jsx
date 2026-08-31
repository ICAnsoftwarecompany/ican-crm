import { AppModal } from './AppModal'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { cn } from '../../utils/cn'

export function FormDialog({
  open,
  onClose,
  title,
  description,
  children,
  onSubmit,
  submitText = 'حفظ',
  cancelText = 'إلغاء',
  loading = false,
  submitDisabled = false,
  size = 'md',
  showCancel = true,
  showCloseButton = true,
  className,
  contentClassName,
}) {
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
              {cancelText}
            </Button>
          )}
          <Button
            type="submit"
            form="form-dialog"
            loading={loading}
            disabled={submitDisabled || loading}
          >
            {submitText}
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
