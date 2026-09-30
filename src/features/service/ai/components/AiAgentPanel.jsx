import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Send } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { formatRelativeTime } from '../../../../shared/utils/dateTime'
import { cn } from '../../../../shared/utils/cn'
import { CustomerSelect } from '../../records/components/CustomerSelect'
import { useAgentConversation, useAgentConversations, useAiMutations } from '../api/aiApi'
import { AgentChatLog } from './AgentChatLog'

/**
 * Settings → AI agent (spec §45.3): try the agent on one customer's data (test console — nothing is sent and no case is
 * opened) and watch real conversations: which the agent handled and which it handed to a person, and why.
 */
export function AiAgentPanel({ resource }) {
  const { t, i18n } = useTranslation()
  const { agentTest } = useAiMutations()
  const [customerId, setCustomerId] = useState('')
  const [message, setMessage] = useState('')
  const [test, setTest] = useState(null)
  const [status, setStatus] = useState('')
  const [openId, setOpenId] = useState(null)
  const conversations = useAgentConversations({ status: status || undefined })
  const detail = useAgentConversation(openId)
  const send = () => {
    if (!message.trim() || !customerId) return
    agentTest.mutate({ customer_id: customerId, message, conversation_id: test?.customer_id === customerId && test?.status === 'ai' ? test.id : undefined }, { onSuccess: (conversation) => { setTest(conversation); setMessage('') } })
  }
  const summary = conversations.data?.summary
  return (
    <div className="grid gap-4">
      <header className="grid gap-1">
        <h2 className="text-lg font-bold text-[var(--text)]">{t(`${resource.i18nKey}.title`)}</h2>
        <p className="text-sm text-[var(--text-muted)]">{t(`${resource.i18nKey}.description`)}</p>
      </header>
      <section className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4" aria-label={t('service.ai.agent.console')}>
        <h3 className="text-sm font-semibold text-[var(--text)]">{t('service.ai.agent.console')}</h3>
        <p className="text-xs text-[var(--text-muted)]">{t('service.ai.agent.consoleHint')}</p>
        <CustomerSelect value={customerId} onChange={(value) => { setCustomerId(value); setTest(null) }} />
        {test && <div className="max-h-80 overflow-y-auto rounded-md border border-[var(--border)] p-3"><AgentChatLog messages={test.messages} /></div>}
        {test?.status === 'handed_off' && <p className="text-xs font-medium text-sla-at-risk">{t('service.ai.agent.wouldHandOff', { reason: t(`service.ai.agent.reasons.${test.handoff_reason}`) })}</p>}
        <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); send() }}>
          <div className="flex-1"><Input dir="auto" value={message} onChange={(event) => setMessage(event.target.value)} placeholder={t('service.ai.agent.placeholder')} aria-label={t('service.ai.agent.placeholder')} disabled={!customerId} /></div>
          <Button type="submit" loading={agentTest.isPending} disabled={!customerId || !message.trim()}><Send size={16} aria-hidden="true" className="rtl:-scale-x-100" />{t('service.ai.agent.send')}</Button>
        </form>
      </section>
      <section className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4" aria-label={t('service.ai.agent.conversations')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[var(--text)]">{t('service.ai.agent.conversations')}</h3>
          {summary && <span className="text-xs text-[var(--text-muted)]">{t('service.ai.agent.summary', { total: summary.total, ai: summary.resolved_by_ai, handed: summary.handed_off })}</span>}
        </div>
        <div className="flex gap-2" role="tablist" aria-label={t('service.ai.agent.conversations')}>
          {['', 'ai', 'handed_off'].map((key) => (
            <button key={key || 'all'} type="button" role="tab" aria-selected={status === key} onClick={() => setStatus(key)} className={cn('rounded-full border px-3 py-1 text-xs', status === key ? 'border-brand-accent font-semibold text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-muted)]')}>{t(`service.ai.agent.statuses.${key || 'all'}`)}</button>
          ))}
        </div>
        <ResourceState isLoading={conversations.isLoading} error={conversations.error} onRetry={conversations.refetch} empty={!conversations.data?.data?.length} emptyTitle={t('service.ai.agent.empty')}>
          <ul className="divide-y divide-[var(--border)]">
            {(conversations.data?.data || []).map((entry) => (
              <li key={entry.id} className="grid gap-2 py-2">
                <button type="button" className="flex flex-wrap items-center justify-between gap-2 text-start" aria-expanded={openId === entry.id} onClick={() => setOpenId(openId === entry.id ? null : entry.id)}>
                  <span className="grid">
                    <span className="text-sm text-[var(--text)]">{entry.customer?.name} · {t(`service.ai.agent.channels.${entry.channel}`)}</span>
                    <span className="text-xs text-[var(--text-muted)]">{[t('service.ai.agent.messages', { count: entry.messages_count }), formatRelativeTime(entry.updated_at, i18n.language)].join(' · ')}</span>
                  </span>
                  <span className={cn('text-xs font-medium', entry.status === 'ai' ? 'text-sla-on-track' : 'text-sla-at-risk')}>{entry.status === 'ai' ? t('service.ai.agent.statuses.ai') : t('service.ai.agent.handedBecause', { reason: t(`service.ai.agent.reasons.${entry.handoff_reason}`) })}</span>
                </button>
                {entry.case && <Link to={`/service/cases/${entry.case.id}`} className="w-fit text-xs font-medium text-brand-accent hover:underline"><span dir="ltr">{entry.case.case_number}</span></Link>}
                {openId === entry.id && detail.data && <div className="rounded-md border border-[var(--border)] p-3"><AgentChatLog messages={detail.data.messages} /></div>}
              </li>
            ))}
          </ul>
        </ResourceState>
      </section>
    </div>
  )
}
