import { Send } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/Button'
import { useTranslation } from 'react-i18next'

export function SocialMessageDialogFooter({
  canSend = false,
  isSending = false,
  onCancel,
  onSend,
}) {
  const { t } = useTranslation()
  return (
    <>
      <Button type="button" variant="outline" onClick={onCancel}>{t('customers.socialMessaging.cancel')}</Button>
      <Button
        type="button"
        variant="ai"
        onClick={onSend}
        loading={isSending}
        disabled={!canSend}
        className="min-w-32"
      >
        <Send size={15} />
        {t('customers.socialMessaging.send')}
      </Button>
    </>
  )
}
