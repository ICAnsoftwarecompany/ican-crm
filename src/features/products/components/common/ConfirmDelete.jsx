import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ConfirmDialog } from '../../../../shared/components/overlays/ConfirmDialog'
import { formatApiError } from '../../utils/apiErrors'

/**
 * Confirm-then-run for destructive catalog actions (delete, void). `run(target)` returns a promise;
 * failures show the backend message as a toast. Added 2026-10-06.
 */
export function useConfirmAction({ run, successMessage, failureMessage }) {
  const [target, setTarget] = useState(null)
  const [loading, setLoading] = useState(false)

  const confirm = async () => {
    setLoading(true)
    try {
      await run(target)
      if (successMessage) toast.success(successMessage)
      setTarget(null)
    } catch (error) {
      toast.error(formatApiError(error, failureMessage))
    } finally {
      setLoading(false)
    }
  }

  return { target, ask: setTarget, cancel: () => setTarget(null), confirm, loading }
}

export function ConfirmActionDialog({ action, title, message, confirmText, type = 'danger' }) {
  const { t } = useTranslation()
  return (
    <ConfirmDialog
      isOpen={Boolean(action.target)}
      onCancel={action.cancel}
      onConfirm={action.confirm}
      loading={action.loading}
      type={type}
      title={title}
      message={message}
      confirmText={confirmText ?? t('actions.delete')}
    />
  )
}
