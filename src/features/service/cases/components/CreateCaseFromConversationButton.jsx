import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Inbox } from 'lucide-react'
import { useServiceTerminology } from '../../core/capabilities/useServiceCapabilities'
import { CaseCreateDialog } from './CaseCreateDialog'

const CHANNEL_KEYS = { whatsapp: 'whatsapp', messenger: 'messenger', gmail: 'email', email: 'email' }

/**
 * "Create case" action for a conversation thread header.
 * Rendered by pages/conversations through the workspaces'
 * `threadHeaderActions` slot, so conversations never import Service code.
 *
 * @param {{ details: { name?: string, phone?: string, channel?: string, conversationId?: string, customer?: { id: string|number, name?: string, phone?: string } | null } }} props
 */
export function CreateCaseFromConversationButton({ details }) {
  const { t } = useTranslation()
  const term = useServiceTerminology()
  const [open, setOpen] = useState(false)
  if (!details?.conversationId) return null

  const customer = details.customer?.id != null
    ? { id: String(details.customer.id), name: details.customer.name || details.name || '', phone: details.customer.phone || details.phone || '' }
    : null
  const label = t('service.cases.fromConversation.button', { entity: term('case') })

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={label}
        className="inline-flex h-7 items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 text-[10px] font-bold text-[var(--text)] transition-colors hover:border-brand-accent hover:bg-[var(--brand-accent-soft)]"
      >
        <Inbox size={12} aria-hidden="true" />
        {label}
      </button>
      <CaseCreateDialog
        open={open}
        onClose={() => setOpen(false)}
        navigateOnCreate
        defaults={{
          customer,
          source_channel: CHANNEL_KEYS[String(details.channel || '').toLowerCase()] || 'internal',
          conversation_id: String(details.conversationId),
        }}
      />
    </>
  )
}
