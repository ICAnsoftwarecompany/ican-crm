import { Send } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/Button'

export function SocialMessageDialogFooter({
  canSend = false,
  isSending = false,
  onCancel,
  onSend,
}) {
  return (
    <>
      <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
      <Button
        type="button"
        variant="ai"
        onClick={onSend}
        loading={isSending}
        disabled={!canSend}
        className="min-w-32"
      >
        <Send size={15} />
        إرسال الرسالة
      </Button>
    </>
  )
}
