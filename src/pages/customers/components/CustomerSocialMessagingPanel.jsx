import { useMemo, useState } from 'react'
import { Mail, MessageCircle, Send, MessagesSquare } from 'lucide-react'
import { toast } from 'sonner'

import { AppModal } from '../../../shared/components/overlays/AppModal'
import { Button } from '../../../shared/components/ui/Button'

export const SOCIAL_MESSAGE_CHANNELS = [
  {
    id: 'messenger',
    label: 'ماسنجر',
    accent: '#0A7CFF',
    icon: MessageCircle,
  },
  {
    id: 'whatsapp',
    label: 'واتس اب',
    accent: '#128C7E',
    icon: MessagesSquare,
  },
  {
    id: 'tiktok',
    label: 'تيك توك',
    accent: '#111827',
    icon: null,
    shortLabel: 'TT',
  },
  {
    id: 'snapchat',
    label: 'سناب شات',
    accent: '#F7D000',
    icon: null,
    shortLabel: 'SC',
  },
  {
    id: 'mail',
    label: 'Mail',
    accent: '#EA4335',
    icon: Mail,
  },
  {
    id: 'sms',
    label: 'SMS',
    accent: '#2563EB',
    icon: MessageCircle,
  },
]

function getCustomerName(customer) {
  return customer?.lead?.name || customer?.name || customer?.lead?.email || customer?.email || customer?.lead?.phone || customer?.phone || 'العميل'
}

function getCustomerContact(customer) {
  return customer?.lead?.phone || customer?.phone || customer?.lead?.email || customer?.email || ''
}

function getCustomerLeadId(customer) {
  return customer?.lead?.id ?? customer?.lead_id ?? customer?.id ?? null
}

export function CustomerSocialMessagingPanel({
  customers = [],
  channelId,
  isOpen = false,
  onClose,
  onSendMessage,
}) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const activeChannel = useMemo(
    () => SOCIAL_MESSAGE_CHANNELS.find((channel) => channel.id === channelId) || SOCIAL_MESSAGE_CHANNELS[0],
    [channelId]
  )

  const recipients = useMemo(() => {
    if (!Array.isArray(customers)) return []
    return customers
      .map((customer) => ({
        id: customer?.id ?? null,
        lead_id: getCustomerLeadId(customer),
        name: getCustomerName(customer),
        contact: getCustomerContact(customer),
        phone: customer?.lead?.phone || customer?.phone || '',
        email: customer?.lead?.email || customer?.email || '',
      }))
      .filter((recipient) => recipient.lead_id !== null && recipient.lead_id !== undefined && recipient.lead_id !== '')
  }, [customers])

  if (!isOpen) return null

  const handleSend = async () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage) {
      toast.error('اكتب رسالة أولًا.')
      return
    }

    if (!recipients.length) {
      toast.error('لا يوجد عملاء صالحون للإرسال.')
      return
    }

    const payload = {
      channel: activeChannel.id,
      recipients,
      message: trimmedMessage,
      source: 'customers_bulk_actions',
      status: 'draft',
    }

    try {
      setIsSending(true)

      if (typeof onSendMessage === 'function') {
        await onSendMessage(payload)
        toast.success(`تم تجهيز الرسالة للإرسال إلى ${recipients.length} عميل.`)
      } else {
        toast.info(`واجهة الرسائل جاهزة للربط بالـ API لاحقًا (${recipients.length} عميل).`)
      }

      setMessage('')
      onClose?.()
    } catch (error) {
      toast.error(error?.message || 'تعذر تجهيز الرسالة.')
    } finally {
      setIsSending(false)
    }
  }

  const recipientsPreview = recipients.slice(0, 4)
  const extraRecipientsCount = Math.max(0, recipients.length - recipientsPreview.length)

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={`إرسال رسالة عبر ${activeChannel.label}`}
      description={`سيتم إرسال نفس الرسالة إلى ${recipients.length} عميل`}
      size="lg"
      className="max-w-2xl"
      footer={(
        <>
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button
            type="button"
            variant="ai"
            onClick={handleSend}
            loading={isSending}
            disabled={!message.trim() || !recipients.length}
            className="min-w-32"
          >
            <Send size={15} />
            إرسال الرسالة
          </Button>
        </>
      )}
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-[#D7EEF0] bg-[#F8FEFF] p-3">
          <div className="text-xs font-black text-[var(--text)]">العملاء المحددون ({recipients.length})</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {recipientsPreview.map((recipient) => (
              <span
                key={`${recipient.lead_id}-${recipient.id || 'x'}`}
                className="inline-flex items-center rounded-full border border-[#CDEEEF] bg-white px-2 py-1 text-[11px] font-bold text-[var(--text)]"
              >
                {recipient.name}
              </span>
            ))}
            {extraRecipientsCount > 0 && (
              <span className="inline-flex items-center rounded-full border border-[#CDEEEF] bg-white px-2 py-1 text-[11px] font-bold text-[var(--text-muted)]">
                +{extraRecipientsCount}
              </span>
            )}
          </div>
        </div>

        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={`اكتب رسالة ${activeChannel.label}...`}
          rows={6}
          className="min-h-28 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm font-semibold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
        />

        <div className="text-xs font-semibold text-[var(--text-muted)]">
          جاهز للربط لاحقًا مع API الرسائل. سيتم إرسال نفس النص لكل العملاء المحددين.
        </div>
      </div>
    </AppModal>
  )
}
