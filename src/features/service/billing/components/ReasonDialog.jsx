import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'

/** Small dialog that collects a required reason (cancel, reverse, waive fee, reject). Audit needs the why. */
export function ReasonDialog({ open, onClose, title, description, submitText, loading, onSubmit, required = true }) {
  const { t } = useTranslation()
  const [reason, setReason] = useState('')
  useEffect(() => {
    if (open) setReason('')
  }, [open])
  return (
    <FormDialog open={open} onClose={onClose} title={title} description={description} submitText={submitText} loading={loading} submitDisabled={required && !reason.trim()} onSubmit={() => onSubmit(reason.trim())}>
      <Input label={t('service.billing.reason')} dir="auto" value={reason} onChange={(event) => setReason(event.target.value)} autoFocus />
    </FormDialog>
  )
}
